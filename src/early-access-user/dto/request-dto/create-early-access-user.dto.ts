import { IsEmail } from 'class-validator';

export class CreateEarlyAccessUserDto {
  @IsEmail()
  email: string;
}
