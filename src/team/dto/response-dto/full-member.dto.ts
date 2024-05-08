import { MembersOnTransactions } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';
import { TransactionResponseDto } from 'src/transaction/dto/response-dto/transaction-response.dto';

@Exclude()
export class FullMemberDto {
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

  @Expose()
  transactions: MembersOnTransactions[];
}
