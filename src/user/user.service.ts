import { TeamService } from './../team/team.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager } from '../dal/entity-manager';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { UserDto } from './dto/response-dto/user.dto';
import { RegistrationDto } from 'src/auth/dto/request-dto/registration.dto';
import { ChangePasswordDto } from './dto/request-dto/change-password.dto';
import { plainToInstance } from 'class-transformer';
import { AwsS3Service } from '../storage/services/aws-s3.service';
import { getAwsKey } from '../common/helpers/helpers';
import { SendgridService } from 'src/sendgrid/sendgrid.service';
import { RedisService } from '../infra/redis/redis.service';

@Injectable()
export class UserService {
  constructor(
    private readonly sendgridService: SendgridService,
    private readonly entityManager: EntityManager,
    private readonly awsS3Service: AwsS3Service,
    private readonly redisService: RedisService,
    private readonly teamService: TeamService,
  ) {}

  public async getAllUsers(): Promise<UserDto[]> {
    const users = await this.entityManager.userRepository.findAllUsers();

    return plainToInstance(UserDto, users);
  }

  public async findUserById(id: string): Promise<UserDto> {
    const user = await this.entityManager.userRepository.findUser({ id });

    return plainToInstance(UserDto, user);
  }

  public findUserByEmail(email: string): Promise<User> {
    return this.entityManager.userRepository.findUser({ email });
  }

  public async createUser(data: RegistrationDto): Promise<UserDto> {
    const user = await this.entityManager.userRepository.createUser(data);

    return plainToInstance(UserDto, user);
  }

  public async createWithGoogle(email: string, name: string): Promise<User> {
    const firstName = name.split(' ')[0];
    const lastName = name.split(' ')[1];

    return this.entityManager.userRepository.createUserWithGoogle(
      email,
      firstName,
      lastName,
    );
  }

  public async setCurrentRefreshToken(
    refreshToken: string,
    userId: string,
  ): Promise<void> {
    const currentHashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.entityManager.userRepository.updateUser(userId, {
      refreshToken: currentHashedRefreshToken,
    });
  }

  public async removeRefreshToken(userId: string): Promise<void> {
    await this.entityManager.userRepository.updateUser(userId, {
      refreshToken: null,
    });
  }

  public async getUserIfRefreshTokenMatches(
    refreshToken: string,
    userId: string,
  ): Promise<UserDto | undefined> {
    const user = await this.findUserById(userId);
    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );
    if (isRefreshTokenMatching) {
      return user;
    }
  }

  public async changePassword(
    id: string,
    data: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.entityManager.userRepository.findUser({
      id: id,
    });
    const isPasswordMatching = await bcrypt.compare(
      data.oldPassword,
      user.password,
    );
    if (!isPasswordMatching) throw new BadRequestException('Wrong password');

    await this.setPassword(id, data.newPassword);
  }

  public async resetPassword(userId: string, password: string): Promise<void> {
    try {
      const user = await this.entityManager.userRepository.findUser({
        id: userId,
      });
      if (!user) throw new NotFoundException('User not found');

      if (!user.isConfirmed)
        throw new BadRequestException('Please confirm your email');

      await this.setPassword(userId, password);
    } catch (error) {
      // TODO: Handle the error here
      console.error(error);
      throw error;
    }
  }

  private async setPassword(userId: string, password: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(password, 10);
    await this.entityManager.userRepository.updateUser(userId, {
      password: hashedPassword,
    });
  }

  public async updateUser(
    userId: string,
    data: Partial<User>,
  ): Promise<UserDto> {
    const user = await this.entityManager.userRepository.updateUser(
      userId,
      data,
    );

    const member = await this.entityManager.memberRepository.findMember({
      userId: userId,
    });
    await this.entityManager.memberRepository.updateMember({
      memberId: member.id,
      firstName: data?.firstName,
      lastName: data?.lastName,
    });
    return plainToInstance(UserDto, user);
  }

  public async deleteUserAvatar(id: string, avatar: string): Promise<void> {
    const fileKey = getAwsKey(avatar);

    if (!fileKey) {
      throw new BadRequestException('User don`t have avatar');
    }

    await Promise.all([
      this.awsS3Service.deleteFileByKey([{ Key: fileKey }]),
      this.entityManager.userRepository.updateUser(id, { avatar: null }),
    ]);
  }

  public async changeEmail(userId: string, newEmail: string): Promise<void> {
    await this.sendgridService.sendConfirmationCode(userId, newEmail);
  }

  public async confirmChangeEmail(userId: string, code: string): Promise<void> {
    const payload = await this.redisService.get(userId);

    if (!payload || payload.code !== code)
      throw new BadRequestException('Invalid code');

    const member = await this.entityManager.memberRepository.findMember({
      userId,
    });

    await Promise.all([
      this.entityManager.userRepository.updateUser(userId, {
        email: payload.newEmail,
      }),
      this.entityManager.memberRepository.updateMember({
        memberId: member.id,
        email: payload.newEmail,
      }),
    ]);
  }

  public async deleteUserByEmail(email: string): Promise<void> {
    const user = await this.entityManager.userRepository.findUser({ email });
    const team = await this.entityManager.teamRepository.findTeam({
      ownerId: user.id,
    });
    if (team) {
      const memberIds = team.members
        .filter((member) => member.userId !== user.id)
        .map((member) => member.id);

      await this.teamService.kickMembers({ memberIds });
    }

    await this.entityManager.userRepository.deleteUserByEmail(email);
  }
}
