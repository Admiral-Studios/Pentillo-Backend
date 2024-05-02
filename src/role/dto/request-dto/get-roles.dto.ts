import { IsString } from 'class-validator';

export class GetRolesDto {
  @IsString()
  teamId: string;
}
