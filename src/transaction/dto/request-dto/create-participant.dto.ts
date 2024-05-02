import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { CreateTransactionContactDto } from '../../../contact/dto/request-dto/create-transaction-contact.dto';

export class CreateParticipantDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  goAgentId?: string;

  @ApiProperty()
  @IsUUID()
  primaryAgentId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  firstAssistantId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  secondAssistantId?: string;

  @ApiProperty()
  @IsUUID('4', { each: true })
  buyerAndSellerIds: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateTransactionContactDto)
  transactionContacts?: CreateTransactionContactDto[];
}
