import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaginationRequestDto } from '../../../common/dto/pagination.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterTransactionNotes extends PaginationRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  search?: string;
}
