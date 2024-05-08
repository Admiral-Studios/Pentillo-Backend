import { IsOptional, IsString, IsUrl } from 'class-validator';

export class EmailDataDto {
  @IsString()
  @IsOptional()
  user?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  subPlan?: string;

  @IsString()
  @IsOptional()
  expTime?: string;

  @IsUrl()
  @IsOptional()
  link?: string;
}
