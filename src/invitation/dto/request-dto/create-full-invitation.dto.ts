import { IsEmail, IsString } from 'class-validator';

export class CreateFullInvitationDto {
  @IsString()
  inviterId: string;

  @IsString()
  teamId: string;

  @IsEmail()
  invitedUserEmail: string;
}
