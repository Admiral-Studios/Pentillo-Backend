import { IsString, IsUUID } from 'class-validator';

export class SetMemberRoleDto {
  @IsUUID()
  memberId: string;

  @IsUUID()
  roleId: string;
}
