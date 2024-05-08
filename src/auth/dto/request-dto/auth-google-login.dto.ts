import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AuthGoogleLoginDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  invitationToken?: string;
}
