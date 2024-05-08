import { IsOptional, IsString, IsUUID } from 'class-validator';
export class CreateMemberDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  teamId: string;

  @IsUUID()
  roleId: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  middleName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  roleName?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  fax?: string;
}
