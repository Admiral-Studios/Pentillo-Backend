import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class TransactionContractResponseDto {
  @Expose()
  id: string;

  @Expose()
  fileNumber?: number;

  @Expose()
  financing?: string;

  @Expose()
  earnestMoney?: number;

  @Expose()
  concessions?: string;

  @Expose()
  additionalProvisions?: string;

  @Expose()
  otherInfo?: string;
}
