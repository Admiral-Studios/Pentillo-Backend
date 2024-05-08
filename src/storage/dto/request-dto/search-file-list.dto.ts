import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrderByEnum } from '../../../common/enums/order-by.enum';
import { PaginationRequestDto } from '../../../common/dto/pagination.dto';
import { FilesOrderByField } from '../../enums/files-order-by-field.enum';

export class GetFilesFilterDto extends PaginationRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID(4)
  listId?: string;

  @ApiPropertyOptional({ enum: OrderByEnum })
  @IsOptional()
  @IsEnum(OrderByEnum)
  orderBy?: OrderByEnum;

  @ApiPropertyOptional({ enum: FilesOrderByField })
  @IsOptional()
  @IsEnum(FilesOrderByField)
  filesOrderByField?: FilesOrderByField;
}
