import { IsEmail, IsString, IsUUID } from 'class-validator';
export class AddMemberDto {
  @IsUUID()
  teamId: string;

  @IsUUID()
  userId: string;

  @IsUUID()
  roleId: string;
}
