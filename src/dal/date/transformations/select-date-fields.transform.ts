import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class SelectDateFieldsTransform {
  @Expose()
  title: string;

  @Expose()
  dueDate: Date;

  @Expose()
  teamId: string;
}
