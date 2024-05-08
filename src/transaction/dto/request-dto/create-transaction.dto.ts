import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  TransactionStatus,
  TransactionSideList,
  TransactionPropertyType,
  TransactionSource,
} from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { CreateDetailsDto } from './create-details.dto';
import { CreateContractDto } from './create-contract.dto';
import { CreateParticipantDto } from './create-participant.dto';

export class CreateTransaction {
  @ApiProperty()
  @IsNumber()
  @IsPositive()
  streetNumber: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  dir: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @IsPositive()
  unit?: number;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  purchase: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @IsPositive()
  netPurchase?: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  zipCode: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @IsPositive()
  listAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  closedDate?: Date;

  @ApiProperty({ enum: TransactionSideList })
  @IsEnum(TransactionSideList)
  side: TransactionSideList;

  @ApiPropertyOptional({ enum: TransactionSource })
  @IsEnum(TransactionSource)
  source?: TransactionSource;

  @ApiProperty({ enum: TransactionPropertyType })
  @IsEnum(TransactionPropertyType)
  propertyType: TransactionPropertyType;

  @ApiProperty({ enum: TransactionStatus })
  @IsEnum(TransactionStatus)
  status: TransactionStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  templateId?: string;
}

export class CreateTransactionDto {
  @ApiProperty()
  @ValidateNested()
  @Type(() => CreateTransaction)
  transaction: CreateTransaction;

  @ApiProperty()
  @ValidateNested()
  @Type(() => CreateDetailsDto)
  transactionDetails: CreateDetailsDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => CreateContractDto)
  contract: CreateContractDto;

  @ApiProperty()
  @ValidateNested()
  @Type(() => CreateParticipantDto)
  participant: CreateParticipantDto;
}
