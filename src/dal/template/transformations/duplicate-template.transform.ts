import { TransactionPropertyType, TransactionSideList } from '@prisma/client';
import { Exclude, Expose, Transform } from 'class-transformer';

@Exclude()
export class DuplicateTemplateTransform {
  @Expose()
  @Transform(({ value }) => `${value}-copy`)
  name: string;

  @Expose()
  propertyTypes: TransactionPropertyType[];

  @Expose()
  states: string[];

  @Expose()
  sides: TransactionSideList[];

  @Expose({ name: 'agents' })
  @Transform(({ value }) => value.map((agent) => agent.id))
  agentIds: string[];
}
