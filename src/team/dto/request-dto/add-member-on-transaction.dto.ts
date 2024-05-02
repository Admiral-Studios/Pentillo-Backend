import { IsString, IsUUID } from 'class-validator';

export class AddMemberOnTransactionDto {
  @IsUUID()
  memberId: string;

  @IsUUID()
  transactionId: string;
}
