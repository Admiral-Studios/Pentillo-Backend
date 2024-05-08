import { Permission } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class RoleDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  teamId: string;

  @Expose()
  permission: Permission;

  @Expose()
  financialAndPayment: boolean;

  @Expose()
  manageTransaction: boolean;

  @Expose()
  manageTemplates: boolean;
}
