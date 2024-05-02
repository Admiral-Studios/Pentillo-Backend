import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { getAwsKey } from '../../../common/helpers/helpers';
import { NoteResponseDto } from '../../../notes/dto/response-dto/note-response.dto';

@Exclude()
export class FileDetailsToSaveTransform {
  @Expose({ name: 'originalname' })
  name: string;

  @Expose({ name: 'mimetype' })
  mimeType: string;

  @Expose({ name: 'fileInfo' })
  @Transform(({ value }) => getAwsKey(value))
  key: string;

  @Expose()
  @Transform(({ obj }) => obj.fileInfo)
  fullPath: string;

  @Expose()
  size: number;

  @Expose()
  @Type(() => NoteResponseDto)
  notes?: NoteResponseDto[];

  @Expose()
  userId: string;

  @Expose()
  transactionId?: string;

  @Expose()
  listId: string;

  @Expose()
  @Transform(({ obj }) => obj.mimetype.split('/')[1])
  type: string;
}
