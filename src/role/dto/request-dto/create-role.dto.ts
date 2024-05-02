import { ApiProperty } from '@nestjs/swagger';
import { Permission } from '@prisma/client';
import { IsBoolean, IsEnum, IsString } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  name: string;

  @IsEnum(Permission)
  @ApiProperty({ example: Permission.FULL_ACCESS })
  financialAndPayment: Permission;

  @IsEnum(Permission)
  @ApiProperty({ example: Permission.FULL_ACCESS })
  manageTransaction: Permission;

  @IsEnum(Permission)
  @ApiProperty({ example: Permission.FULL_ACCESS })
  manageTemplates: Permission;

  @IsBoolean()
  savedAsTemplate: boolean;
}
