import { IsEmail } from 'class-validator';

export class DeleteUserDto {
  @IsEmail()
  email: string;
}
