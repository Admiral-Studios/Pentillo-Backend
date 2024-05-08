import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class TransactionPayoutResponseDto {
  @Expose()
  id: string;

  @Expose()
  broker?: number;

  @Expose()
  teamLead?: number;

  @Expose()
  primaryAgent?: number;

  @Expose()
  goAgent?: number;

  @Expose()
  referral?: number;

  @Expose()
  firstAssistant?: number;

  @Expose()
  secondAssistant?: number;

  @Expose()
  agentCommission?: number;

  @Expose()
  estimatedGrossPayout?: number;

  @Expose()
  actualGrossPayout?: number;

  @Expose()
  commissionNote?: number;
}
