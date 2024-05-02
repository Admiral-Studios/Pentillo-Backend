import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { PaginationRequestDto } from 'src/common/dto/pagination.dto';
import { OrderByEnum } from 'src/common/enums/order-by.enum';
import { MembersOrderByField } from 'src/team/enums/members-order-by-field.enum';

export class SearchMembersDto extends PaginationRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 30)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 30)
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 30)
  role?: string;

  @ApiPropertyOptional({ enum: OrderByEnum })
  @IsOptional()
  @IsEnum(OrderByEnum)
  orderBy?: OrderByEnum;

  @ApiPropertyOptional({ enum: MembersOrderByField })
  @IsOptional()
  @IsEnum(MembersOrderByField)
  membersOrderByField?: MembersOrderByField;
}
