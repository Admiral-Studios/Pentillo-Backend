import { Exclude, Expose } from 'class-transformer';
import { SubscriptionDto } from 'src/subscription/dto/response-dto/subscription.dto';
import { MemberDto } from 'src/team/dto/response-dto/member.dto';

@Exclude()
export class UserDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  avatar: string;

  @Expose()
  fax?: number;

  @Expose()
  phone?: string;

  @Expose()
  member: MemberDto;

  @Expose()
  refreshToken: string;

  @Expose()
  company: string;

  @Expose()
  subscription: SubscriptionDto;

  @Expose()
  isSignedByGoogle: boolean;
}
