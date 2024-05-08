import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class SelectNoteFieldsTransform {
  @Expose()
  text: string;
}
