import { IsBoolean, IsDate, IsOptional, IsString } from 'class-validator';

export class SubscriptionDto {
  @IsBoolean()
  isActive: boolean;

  @IsString()
  stripeSessionId: string;

  @IsString()
  @IsOptional()
  stripeSubscriptionId?: string;

  @IsString()
  @IsOptional()
  stripeCustomerId: string;

  @IsString()
  userId: string;

  @IsDate()
  startDate: Date;

  @IsDate()
  endDate: Date;
}
