import { TypeList } from '@prisma/client';
import { Exclude, Expose, Type } from 'class-transformer';
import { SelectTaskFieldsTransform } from '../../task/transformations/select-task-fields.transform';
import { SelectDateFieldsTransform } from '../../date/transformations/select-date-fields.transform';
import { SelectFileFieldsTransform } from '../../file/transformations/select-file-fields.transform';

@Exclude()
export class SelectListFieldsTransform {
  @Expose()
  name: string;

  @Expose()
  type: TypeList;

  @Expose()
  userId: string;

  @Expose()
  teamId: string;

  @Expose()
  @Type(() => SelectFileFieldsTransform)
  files: SelectFileFieldsTransform[];

  @Expose()
  @Type(() => SelectDateFieldsTransform)
  dates: SelectDateFieldsTransform[];

  @Expose()
  @Type(() => SelectTaskFieldsTransform)
  tasks: SelectTaskFieldsTransform[];
}
