import { Exclude, Expose, Type } from 'class-transformer';
import { TransactionResponseDto } from './transaction-response.dto';

@Exclude()
export class TransactionListResponse {
  @Expose()
  @Type(() => TransactionResponseDto)
  data: TransactionResponseDto[];

  @Expose()
  count: number;
}
