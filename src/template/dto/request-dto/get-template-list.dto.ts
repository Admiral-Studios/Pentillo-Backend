import { IsArray, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationRequestDto } from '../../../common/dto/pagination.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { transformValueToArray } from '../../../common/helpers/helpers';
import { TransactionPropertyType, TransactionSideList } from '@prisma/client';
import { TemplateSortByFieldsEnum } from '../../interfaces/template-sort-by-fields.enum';
import { OrderByEnum } from '../../../common/enums/order-by.enum';

export class GetTemplateList extends PaginationRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(transformValueToArray)
  @IsArray()
  @IsString({ each: true })
  name?: string[];

  @ApiPropertyOptional({ enum: TransactionSideList })
  @IsOptional()
  @Transform(transformValueToArray)
  @IsArray()
  @IsEnum(TransactionSideList, { each: true })
  sides?: TransactionSideList[];

  @ApiPropertyOptional({ enum: TransactionPropertyType })
  @IsOptional()
  @Transform(transformValueToArray)
  @IsArray()
  @IsEnum(TransactionPropertyType, { each: true })
  propertyTypes?: TransactionPropertyType[];

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(transformValueToArray)
  @IsArray()
  @IsString({ each: true })
  states?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(transformValueToArray)
  @IsArray()
  @IsUUID('4', { each: true })
  agentIds?: string[];

  @ApiPropertyOptional({ enum: OrderByEnum })
  @IsOptional()
  @IsEnum(OrderByEnum)
  orderBy?: OrderByEnum;

  @ApiPropertyOptional({ enum: TemplateSortByFieldsEnum })
  @IsOptional()
  @IsEnum(TemplateSortByFieldsEnum)
  orderByField?: TemplateSortByFieldsEnum;
}
