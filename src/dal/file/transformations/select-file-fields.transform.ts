import { Exclude, Expose, Type } from 'class-transformer';
import { SelectNoteFieldsTransform } from '../../notes/transformations/select-note-fields.transform';

@Exclude()
export class SelectFileFieldsTransform {
  @Expose()
  name: string;

  @Expose()
  size: number;

  @Expose()
  mimeType: string;

  @Expose()
  key: string;

  @Expose()
  fullPath: string;

  @Expose()
  @Type(() => SelectNoteFieldsTransform)
  notes?: SelectNoteFieldsTransform[];

  @Expose()
  type: string;
}
