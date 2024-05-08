import { IsString } from 'class-validator';

export class ConfirmChangeEmailDto {
  @IsString()
  code: string;
}
