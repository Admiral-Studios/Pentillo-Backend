import { Exclude, Expose } from 'class-transformer';
import { MemberDto } from './member.dto';

@Exclude()
export class TeamDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  members: MemberDto[];

  @Expose()
  ownerId: string;
}
