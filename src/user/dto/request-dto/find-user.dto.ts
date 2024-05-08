import { IsEmail, IsOptional, IsString } from 'class-validator';

export class FindUserDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
