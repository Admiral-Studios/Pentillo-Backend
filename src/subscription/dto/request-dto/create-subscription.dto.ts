import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubscriptionType } from '@prisma/client';
import { IsEnum, IsOptional, Matches } from 'class-validator';

export class CreateSubscriptionDto {
  @IsEnum(SubscriptionType)
  @ApiProperty({ example: SubscriptionType.MONTHLY })
  type: SubscriptionType;

  @IsOptional()
  @ApiPropertyOptional()
  @Matches(/^\/.*/)
  @ApiProperty({ required: false, example: '/success' })
  successUrl?: string;
}
