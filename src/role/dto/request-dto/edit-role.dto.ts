import { ApiProperty } from '@nestjs/swagger';
import { Permission } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export class EditRoleDto {
  @IsString()
  roleId: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(Permission)
  @IsOptional()
  @ApiProperty({ example: Permission.FULL_ACCESS })
  financialAndPayment?: Permission;

  @IsEnum(Permission)
  @IsOptional()
  @ApiProperty({ example: Permission.FULL_ACCESS })
  manageTransaction?: Permission;

  @IsEnum(Permission)
  @IsOptional()
  @ApiProperty({ example: Permission.FULL_ACCESS })
  manageTemplates?: Permission;

  @IsBoolean()
  @IsOptional()
  savedAsTemplate?: boolean;
}
