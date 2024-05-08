import { SetMetadata } from '@nestjs/common';
import { Permission } from '@prisma/client';

export const Role = (permission: string, status: Permission): any => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata('permission', permission)(target, propertyKey, descriptor);
    SetMetadata('status', status)(target, propertyKey, descriptor);
  };
};
