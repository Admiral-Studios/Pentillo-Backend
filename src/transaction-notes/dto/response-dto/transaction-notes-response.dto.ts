import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class TransactionNoteResponseDto {
  @Expose()
  id: string;

  @Expose()
  text: string;

  @Expose()
  createdAt: string;
}
