import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import JwtAuthGuard from './guards/jwt-auth.guard';
import JwtRefreshGuard from './guards/jwt-refresh.guard';
import { UserDto } from '../user/dto/response-dto/user.dto';
import { User } from 'src/user/user.decorator';
import { Request } from 'express';
import { ConfirmCodeDto } from './dto/request-dto/confirm-code.dto';
import { AuthGoogleLoginDto } from './dto/request-dto/auth-google-login.dto';
import { LoginDto } from './dto/request-dto/login.dto';
import { RegistrationDto } from './dto/request-dto/registration.dto';
import { ForgotPasswordDto } from './dto/request-dto/forgot-password.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('register')
  public async register(
    @Body() registrationData: RegistrationDto,
  ): Promise<UserDto> {
    return this.authService.register(registrationData);
  }

  @Post('log-in')
  public async logInWithEmail(
    @Body() data: LoginDto,
    @Req() req: Request,
  ): Promise<UserDto> {
    const user = await this.authService.getAuthenticatedUser(data);
    const accessTokenCookie = this.authService.getCookieWithJwtAccessToken(
      user.id,
    );
    const { cookie: refreshTokenCookie, token: refreshToken } =
      this.authService.getCookieWithJwtRefreshToken(user.id);
    await this.userService.setCurrentRefreshToken(refreshToken, user.id);
    req.res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @Post('log-out')
  public async logOut(
    @User() user: UserDto,
    @Req() req: Request,
  ): Promise<void> {
    await this.userService.removeRefreshToken(user.id);
    req.res.setHeader('Set-Cookie', this.authService.getCookiesForLogOut());
    req.res.send({ res: 'User log out' });
  }

  @UseGuards(JwtRefreshGuard)
  @ApiCookieAuth()
  @Get('refresh')
  public async refresh(
    @Req() req: Request,
    @User() user: UserDto,
  ): Promise<UserDto> {
    const accessTokenCookie = this.authService.getCookieWithJwtAccessToken(
      user.id,
    );

    req.res.setHeader('Set-Cookie', accessTokenCookie);
    return user;
  }

  @Post('confirm')
  public async confirmUser(
    @Body() data: ConfirmCodeDto,
    @Req() req: Request,
  ): Promise<boolean> {
    const result = await this.authService.confirmUser(data.email, data.code);
    const user = await this.userService.findUserByEmail(data.email);
    const accessTokenCookie = this.authService.getCookieWithJwtAccessToken(
      user.id,
    );
    const { cookie: refreshTokenCookie, token: refreshToken } =
      this.authService.getCookieWithJwtRefreshToken(user.id);
    await this.userService.setCurrentRefreshToken(refreshToken, user.id);

    req.res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);
    return result;
  }

  @Post('forgot-password')
  public async forgotPassword(
    @Body() data: ForgotPasswordDto,
  ): Promise<boolean> {
    return await this.authService.forgotPassword(data.email);
  }

  @Post('google')
  public async login(
    @Body() dto: AuthGoogleLoginDto,
    @Req() req: Request,
  ): Promise<UserDto> {
    const user = await this.authService.authByGoogle(dto);
    const accessTokenCookie = this.authService.getCookieWithJwtAccessToken(
      user.id,
    );
    const { cookie: refreshTokenCookie, token: refreshToken } =
      this.authService.getCookieWithJwtRefreshToken(user.id);
    await this.userService.setCurrentRefreshToken(refreshToken, user.id);
    req.res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @Get('user')
  public getCurrentUser(@User() user: UserDto): UserDto {
    return user;
  }
}
