import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class MemberDto {
  @Expose()
  id: string;

  @Expose()
  teamId: string;

  @Expose()
  firstName: string;

  @Expose()
  middleName?: string;

  @Expose()
  lastName: string;

  @Expose()
  roleName: string;

  @Expose()
  email: string;

  @Expose()
  title?: string;

  @Expose()
  recentTransactionName?: string;

  @Expose()
  recentTransactionId?: string;
}
