import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class EarlyAccessUserDto {
  @Expose()
  email: string;
}
