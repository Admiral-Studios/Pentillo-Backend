import { TransactionPropertyType, TransactionSideList } from '@prisma/client';
import { Exclude, Expose, Transform } from 'class-transformer';
import { ResponseAgentsInterface } from '../../interfaces/response-agents.interface';
import { ApiPropertyOptional } from '@nestjs/swagger';

@Exclude()
export class TemplateResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @ApiPropertyOptional({ isArray: true, enum: TransactionPropertyType })
  @Expose()
  propertyTypes?: TransactionPropertyType[];

  @Expose()
  states?: string[];

  @ApiPropertyOptional({ isArray: true, enum: TransactionSideList })
  @Expose()
  sides?: TransactionSideList[];

  @ApiPropertyOptional({ isArray: true })
  @Expose()
  @Transform(({ value }) => value?.map((agent) => agent.contact))
  agents?: ResponseAgentsInterface[];
}
