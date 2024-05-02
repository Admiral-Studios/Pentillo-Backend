import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

export class CreatePortalSessionDto {
  @Matches(/^\/.*/)
  @ApiProperty({ example: '/success' })
  returnUrl: string;
}
