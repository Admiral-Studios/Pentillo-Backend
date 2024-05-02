import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsUUID } from 'class-validator';
import { transformValueToArray } from '../helpers/helpers';

export class ParamsIdsDto {
  @ApiProperty({ isArray: true })
  @Transform(transformValueToArray)
  @IsArray()
  @IsUUID('4', { each: true })
  ids: string[];
}
