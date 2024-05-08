import { IsString, Length } from 'class-validator';

export class CreateTeamDto {
  @IsString()
  @Length(2, 30)
  name: string;
}
