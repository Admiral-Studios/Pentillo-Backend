import {
  IsArray,
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';
import { PaginationRequestDto } from '../../../common/dto/pagination.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  TransactionPropertyType,
  TransactionSideList,
  TransactionStatus,
} from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { transformValueToArray } from '../../../common/helpers/helpers';
import { OrderByEnum } from '../../../common/enums/order-by.enum';
import { SortByFieldsEnum } from '../../interfaces/sort-by-fields.enum';

export class GetListTransaction extends PaginationRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  minPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  maxPrice?: number;

  @ApiPropertyOptional({ isArray: true, enum: TransactionStatus })
  @IsOptional()
  @Transform(transformValueToArray)
  @IsArray()
  @IsEnum(TransactionStatus, { each: true })
  status?: TransactionStatus[];

  @ApiPropertyOptional({ isArray: true, enum: TransactionPropertyType })
  @IsOptional()
  @Transform(transformValueToArray)
  @IsArray()
  @IsEnum(TransactionPropertyType, { each: true })
  propertyType?: TransactionPropertyType[];

  @ApiPropertyOptional({ isArray: true })
  @IsOptional()
  @Transform(transformValueToArray)
  @IsArray()
  @IsString({ each: true })
  address?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  endDate?: string;

  @ApiPropertyOptional({ isArray: true })
  @IsOptional()
  @Transform(transformValueToArray)
  @IsUUID('4', { each: true })
  @IsArray()
  buyerAndSellerIds?: string[];

  @ApiPropertyOptional({ isArray: true })
  @IsOptional()
  @Transform(transformValueToArray)
  @IsUUID('4', { each: true })
  @IsArray()
  agents?: string[];

  @ApiPropertyOptional({ isArray: true, enum: TransactionSideList })
  @IsOptional()
  @Transform(transformValueToArray)
  @IsArray()
  @IsEnum(TransactionSideList, { each: true })
  side?: TransactionSideList[];

  @ApiPropertyOptional({ enum: OrderByEnum })
  @IsOptional()
  @IsEnum(OrderByEnum)
  orderBy?: OrderByEnum;

  @ApiPropertyOptional({ enum: SortByFieldsEnum })
  @IsOptional()
  @IsEnum(SortByFieldsEnum)
  orderByField?: SortByFieldsEnum;
}
