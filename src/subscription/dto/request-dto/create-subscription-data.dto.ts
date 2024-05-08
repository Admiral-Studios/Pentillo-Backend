import { SubscriptionType } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';

export class CreateSubscriptionDataDto {
  @IsString()
  stripeSessionId: string;

  @IsString()
  userId: string;

  @IsEnum(SubscriptionType)
  type: SubscriptionType;
}
