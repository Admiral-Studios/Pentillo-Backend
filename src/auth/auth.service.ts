import { TeamService } from 'src/team/team.service';
import { SendgridService } from './../sendgrid/sendgrid.service';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from './interfaces/tokenPayload.interface';
import { ConfigService } from '@nestjs/config';
import { UserDto } from '../user/dto/response-dto/user.dto';
import { GOOGLE_CLIENT } from './google.provider';
import { Auth, google } from 'googleapis';
import { AuthGoogleLoginDto } from './dto/request-dto/auth-google-login.dto';
import { RegistrationDto } from './dto/request-dto/registration.dto';
import { LoginDto } from './dto/request-dto/login.dto';
import { plainToInstance } from 'class-transformer';
import { InvitationService } from 'src/invitation/invitation.service';
import { RedisService } from '../infra/redis/redis.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(GOOGLE_CLIENT) private readonly googleClient: Auth.OAuth2Client,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly sendgridService: SendgridService,
    private readonly teamService: TeamService,
    private readonly invitationService: InvitationService,
    private readonly redisService: RedisService,
  ) {}

  public async register(data: RegistrationDto): Promise<UserDto> {
    //TODO: rewrite to delete user not update
    try {
      const user = await this.userService.findUserByEmail(data.email);
      data.password = await bcrypt.hash(data.password, 10);
      const { invitationToken, ...dataWithoutInvitationToken } = data;
      if (!user) {
        const newUser = await this.userService.createUser(
          dataWithoutInvitationToken,
        );

        this.sendgridService.sendConfirmationCode(newUser.id);

        if (invitationToken) {
          await this.invitationService.acceptInvitation(
            invitationToken,
            newUser.id,
          );

          return newUser;
        }

        const team = await this.teamService.createTeam(newUser.id, {
          name: newUser.firstName + ' ' + newUser.lastName,
        });

        return newUser;
      }

      if (user && user.isConfirmed && user.password) {
        throw new BadRequestException(
          'User with such credentials already exists',
        );
      }

      this.sendgridService.sendConfirmationCode(user.id);

      if (invitationToken) {
        await this.invitationService.acceptInvitation(invitationToken, user.id);
      } else {
        await this.teamService.createTeam(user.id, {
          name: user.firstName + ' ' + user.lastName,
        });
      }

      return await this.userService.updateUser(
        user.id,
        dataWithoutInvitationToken,
      );
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  public async getAuthenticatedUser(data: LoginDto): Promise<UserDto> {
    try {
      const user = await this.userService.findUserByEmail(data.email);

      if (!user) throw new BadRequestException('Wrong credentials provided');

      if (!user.isConfirmed)
        throw new BadRequestException('Please confirm your email');

      await this.verifyPassword(data.password, user.password);

      if (data.invitationToken) {
        await this.invitationService.acceptInvitation(
          data.invitationToken,
          user.id,
        );
      }

      return plainToInstance(UserDto, user);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  private async verifyPassword(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<void> {
    const isPasswordMatching = await bcrypt.compare(
      plainTextPassword,
      hashedPassword,
    );
    if (!isPasswordMatching) {
      throw new BadRequestException('Wrong credentials provided');
    }
  }

  public getCookieWithJwtAccessToken(userId: string): string {
    const payload: TokenPayload = { userId };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: `${this.configService.get<string>('JWT_EXPIRATION_TIME')}s`,
    });
    const maxAge = this.configService.get<string>('JWT_EXPIRATION_TIME');

    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=None; Secure`;
  }

  public getCookieWithJwtRefreshToken(userId: string): {
    cookie: string;
    token: string;
  } {
    const payload: TokenPayload = { userId };

    const token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('REFRESH_SECRET'),
      expiresIn: `${this.configService.get<string>(
        'REFRESH_EXPIRATION_TIME',
      )}s`,
    });
    const cookie = `Refresh=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get<string>(
      'REFRESH_EXPIRATION_TIME',
    )}; SameSite=None; Secure`;

    return {
      cookie,
      token,
    };
  }

  public getCookiesForLogOut(): string[] {
    return [
      'Authentication=; HttpOnly; Path=/; Max-Age=0; SameSite=None; Secure',
      'Refresh=; HttpOnly; Path=/; Max-Age=0; SameSite=None; Secure',
    ];
  }

  public async getUserFromAuthenticationToken(token: string): Promise<UserDto> {
    const payload: TokenPayload = this.jwtService.verify(token, {
      secret: this.configService.get<string>('JWT_SECRET'),
    });
    if (payload.userId) {
      return this.userService.findUserById(payload.userId);
    }
  }

  public async confirmUser(email: string, code: string): Promise<boolean> {
    const user = await this.userService.findUserByEmail(email);

    if (!user) throw new BadRequestException('Wrong email');

    const payload = await this.redisService.get(user.id);

    if (!payload || payload.code !== code)
      throw new BadRequestException('Wrong code');

    if (!user.isConfirmed)
      await this.sendgridService.sendGreetingsEmail(user.id);

    await this.userService.updateUser(user.id, { isConfirmed: true });

    return true;
  }

  public async forgotPassword(email: string): Promise<boolean> {
    const user = await this.userService.findUserByEmail(email);
    if (!user) throw new BadRequestException('Wrong email');

    await this.sendgridService.sendConfirmationCode(user.id);

    return true;
  }

  public async authByGoogle(dto: AuthGoogleLoginDto): Promise<UserDto> {
    try {
      const { invitationToken, code } = dto;

      const dataCode = await this.googleClient.getToken(code);

      this.googleClient.setCredentials({
        access_token: dataCode.tokens.access_token,
      });

      const { data } = await google.oauth2('v2').userinfo.get({
        auth: this.googleClient,
      });

      let user = await this.userService.findUserByEmail(data.email);

      if (!user) {
        user = await this.userService.createWithGoogle(data.email, data.name);

        if (invitationToken) {
          await this.invitationService.acceptInvitation(
            invitationToken,
            user.id,
          );
        } else {
          const team = await this.teamService.createTeam(user.id, {
            name: data.name,
          });
        }
      } else {
        if (invitationToken) {
          await this.invitationService.acceptInvitation(
            invitationToken,
            user.id,
          );
        }
      }

      return plainToInstance(UserDto, user);
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Something went wrong');
    }
  }
}
