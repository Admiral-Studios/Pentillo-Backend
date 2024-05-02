import { Exclude, Expose, Type } from 'class-transformer';
import { MemberDto } from './member.dto';

@Exclude()
export class AllMembersDto {
  @Expose()
  @Type(() => MemberDto)
  data: MemberDto[];

  @Expose()
  count: number;
}
