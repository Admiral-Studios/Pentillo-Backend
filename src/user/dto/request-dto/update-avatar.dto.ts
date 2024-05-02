import { IsUrl } from 'class-validator';

export class UpdateAvatarDto {
  @IsUrl()
  avatar: string;
}
