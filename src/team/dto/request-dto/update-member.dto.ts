import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class UpdateMemberDto {
  @IsUUID()
  memberId: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  @Length(2, 30)
  firstName?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  @Length(2, 30)
  middleName?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  @Length(2, 30)
  lastName?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  @Length(2, 30)
  email?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  @Length(2, 30)
  roleName?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  @Length(2, 30)
  title?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  @Length(2, 30)
  phone?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  @Length(2, 30)
  fax?: string;
}
