import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  MinLength,
  Matches,
  IsOptional,
} from 'class-validator';

export class RegistrationDto {
  @IsString()
  @MinLength(2, { message: 'Field must have a minimum length of 2 characters' })
  firstName: string;

  @IsString()
  @MinLength(2, { message: 'Field must have a minimum length of 2 characters' })
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @Matches(/^(?=.*[A-Z])(?=.*\d).{8,}$/, {
    message:
      'Password must contain at least 8 characters, 1 number, and 1 capital letter',
  })
  @ApiProperty({ example: 'Password123' })
  password: string;

  @IsOptional()
  @IsString()
  invitationToken?: string;
}
