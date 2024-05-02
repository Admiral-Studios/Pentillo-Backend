import { HoaFrequency } from '@prisma/client';
import { Exclude, Expose, Transform } from 'class-transformer';

@Exclude()
export class TransactionDetailsResponseDto {
  @Expose()
  id: string;

  @Expose()
  listDate?: Date;

  @Expose()
  expireDate?: Date;

  @Expose()
  beds?: number;

  @Expose()
  bath?: number;

  @Expose()
  built?: Date;

  @Expose()
  lot?: string;

  @Expose()
  sqft?: number;

  @Expose()
  @Transform(({ value }) => (value !== undefined ? +value : undefined))
  costSqft?: number;

  @Expose()
  map?: string;

  @Expose()
  block?: string;

  @Expose()
  hoaFee?: string;

  @Expose()
  hoaFrequency?: HoaFrequency;

  @Expose()
  parcelId?: string;

  @Expose()
  occupancy: string;

  @Expose()
  lockBoxCode?: string;

  @Expose()
  lockBoxLocation?: string;

  @Expose()
  securityAlarmCode?: string;

  @Expose()
  mls?: string;

  @Expose()
  remark?: string;

  @Expose()
  additionalInfo?: string;
}
