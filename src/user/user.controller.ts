import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UserDto } from './dto/response-dto/user.dto';
import { User } from './user.decorator';
import { ResetPasswordDto } from './dto/request-dto/reset-password.dto';
import JwtAuthGuard from 'src/auth/guards/jwt-auth.guard';
import { UpdateUserAccountDto } from './dto/request-dto/update-user-account.dto';
import { ChangePasswordDto } from './dto/request-dto/change-password.dto';
import { DeleteUserDto } from './dto/request-dto/delete-user.dto';
import { ChangeEmailDto } from './dto/request-dto/change-email.dto';
import { ConfirmChangeEmailDto } from './dto/request-dto/confirm-change-email.dto';

@UseGuards(JwtAuthGuard)
@ApiCookieAuth()
@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  public getAllUsers(): Promise<UserDto[]> {
    return this.userService.getAllUsers();
  }

  @Get(':id')
  public findUserById(@Param('id') id: string): Promise<UserDto> {
    return this.userService.findUserById(id);
  }

  @Patch('change-password')
  public async changePassword(
    @User() user: UserDto,
    @Body() data: ChangePasswordDto,
  ): Promise<void> {
    await this.userService.changePassword(user.id, {
      oldPassword: data.oldPassword,
      newPassword: data.newPassword,
    });
  }

  @Patch('reset-password')
  public async resetPassword(
    @User() user: UserDto,
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<boolean> {
    await this.userService.resetPassword(user.id, resetPasswordDto.newPassword);
    return true;
  }

  @Delete('delete-avatar')
  public deleteUserAvatar(@User() user: UserDto): Promise<void> {
    return this.userService.deleteUserAvatar(user.id, user.avatar);
  }

  @Patch('update-profile')
  async updateProfile(
    @User() user: { id: string },
    @Body() data: UpdateUserAccountDto,
  ) {
    return await this.userService.updateUser(user.id, data);
  }

  @Patch('change-email')
  async changeEmail(
    @User() user: UserDto,
    @Body() data: ChangeEmailDto,
  ): Promise<void> {
    await this.userService.changeEmail(user.id, data.newEmail);
  }

  @Post('confirm-change-email')
  async confirmChangeEmail(
    @User() user: UserDto,
    @Body() data: ConfirmChangeEmailDto,
  ) {
    return await this.userService.confirmChangeEmail(user.id, data.code);
  }

  // TODO: delete route
  @Delete('delete-user')
  public deleteUserByEmail(@Body() data: DeleteUserDto) {
    return this.userService.deleteUserByEmail(data.email);
  }
}
