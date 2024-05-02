import { ApiPropertyOptional } from '@nestjs/swagger';
import { HoaFrequency, TransactionOccupancy } from '@prisma/client';
import {
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateDetailsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  listDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  expireDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @IsPositive()
  beds?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @IsPositive()
  bath?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  built?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  lot?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  block?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  map?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @IsPositive()
  sqft?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @IsPositive()
  costSqft?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  hoaFee?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  parcelId?: string;

  @ApiPropertyOptional({ enum: TransactionOccupancy })
  @IsOptional()
  @IsEnum(TransactionOccupancy)
  occupancy?: TransactionOccupancy;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  lockBoxCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  lockBoxLocation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  securityAlarmCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  mls?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  remark?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  additionalInfo?: string;

  @ApiPropertyOptional({ enum: HoaFrequency })
  @IsOptional()
  @IsEnum(HoaFrequency)
  hoaFrequency?: HoaFrequency;
}
