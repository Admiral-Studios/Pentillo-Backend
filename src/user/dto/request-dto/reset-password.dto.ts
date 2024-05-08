import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @Matches(/^(?=.*[A-Z])(?=.*\d).{8,}$/, {
    message:
      'Password must contain at least 8 characters, 1 number, and 1 capital letter',
  })
  @ApiProperty({ example: 'Password123' })
  newPassword: string;
}
