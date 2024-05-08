import { IsString, IsUUID } from 'class-validator';

export class UpdateRecentActionDto {
  @IsUUID()
  memberId: string;

  @IsString()
  transactionName: string;

  @IsUUID()
  transactionId: string;
}
