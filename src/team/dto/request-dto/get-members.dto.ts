import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { PaginationRequestDto } from 'src/common/dto/pagination.dto';
import { OrderByEnum } from 'src/common/enums/order-by.enum';
import { transformValueToArray } from 'src/common/helpers/helpers';
import { MembersOrderByField } from 'src/team/enums/members-order-by-field.enum';

export class GetMembersDto extends PaginationRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(transformValueToArray)
  @IsArray()
  @IsString({ each: true })
  name?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(transformValueToArray)
  @IsArray()
  @IsString({ each: true })
  email?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(transformValueToArray)
  @IsArray()
  @IsString({ each: true })
  role?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  recentAction?: string;

  @ApiPropertyOptional({ enum: OrderByEnum })
  @IsOptional()
  @IsEnum(OrderByEnum)
  orderBy?: OrderByEnum;

  @ApiPropertyOptional({ enum: MembersOrderByField })
  @IsOptional()
  @IsEnum(MembersOrderByField)
  membersOrderByField?: MembersOrderByField;
}
