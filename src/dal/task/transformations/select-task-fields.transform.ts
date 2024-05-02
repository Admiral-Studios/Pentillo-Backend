import { TaskStatus } from '@prisma/client';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { SelectNoteFieldsTransform } from '../../notes/transformations/select-note-fields.transform';

@Exclude()
export class SelectTaskFieldsTransform {
  @Expose()
  title: string;

  @Expose()
  description?: string;

  @Expose()
  reminderDate?: Date;

  @Expose()
  dueDate: Date;

  @Expose()
  status: TaskStatus;

  @Expose()
  @Type(() => SelectTaskFieldsTransform)
  subTasks?: SelectTaskFieldsTransform[];

  @Expose()
  @Type(() => SelectNoteFieldsTransform)
  notes?: SelectNoteFieldsTransform[];

  @Expose({ name: 'assignedPerson' })
  @Transform(({ value }) => value?.id)
  assignedPersonId?: string;

  @Expose()
  teamId: string;
}
