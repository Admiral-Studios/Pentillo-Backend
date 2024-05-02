import { IsArray, IsUUID } from 'class-validator';

export class KickMemberDto {
  @IsArray()
  @IsUUID('4', { each: true })
  memberIds: string[];
}
