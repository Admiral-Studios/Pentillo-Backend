import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsUUID } from 'class-validator';

export class FileIdsDto {
  @ApiProperty({ isArray: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsArray()
  @IsUUID('4', { each: true })
  fileIds: string[];
}
