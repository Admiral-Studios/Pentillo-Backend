import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { CreateTransaction } from './create-transaction.dto';
import { CreateDetailsDto } from './create-details.dto';
import { CreateContractDto } from './create-contract.dto';

export class UpdateTransactionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => PartialType(CreateTransaction))
  transaction?: CreateTransaction;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => PartialType(CreateDetailsDto))
  transactionDetails?: CreateDetailsDto;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => PartialType(CreateContractDto))
  contract?: CreateContractDto;
}
