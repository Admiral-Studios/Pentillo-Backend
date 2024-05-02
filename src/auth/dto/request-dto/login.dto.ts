import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Matches } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @ApiProperty()
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
