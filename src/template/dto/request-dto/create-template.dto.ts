import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionPropertyType, TransactionSideList } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { transformValueToArray } from '../../../common/helpers/helpers';
import { Transform } from 'class-transformer';

export class CreateTemplateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(transformValueToArray)
  @IsArray()
  @IsUUID('4', { each: true })
  listIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(transformValueToArray)
  @IsArray()
  @IsUUID('4', { each: true })
  agentIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(transformValueToArray)
  @IsArray()
  @IsString({ each: true })
  states?: string[];

  @ApiPropertyOptional({ isArray: true, enum: TransactionPropertyType })
  @IsOptional()
  @Transform(transformValueToArray)
  @IsArray()
  @IsEnum(TransactionPropertyType, { each: true })
  propertyTypes?: TransactionPropertyType[];

  @ApiPropertyOptional({ isArray: true, enum: TransactionSideList })
  @IsOptional()
  @Transform(transformValueToArray)
  @IsArray()
  @IsEnum(TransactionSideList, { each: true })
  sides?: TransactionSideList[];
}
