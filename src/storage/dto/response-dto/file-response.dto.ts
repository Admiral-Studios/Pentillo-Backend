import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { ContactsGlobalSearchResponseDto } from '../../../global-search/dto/response-dto/contacts-global-search-response.dto';

@Exclude()
export class FileResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  @Transform(({ value }) => +(value / 1024).toFixed(2))
  size: number;

  @Expose()
  fullPath: string;

  @Expose()
  note?: string;

  @Expose()
  @Type(() => ContactsGlobalSearchResponseDto)
  user: ContactsGlobalSearchResponseDto;

  @Expose()
  type: string;

  @Expose()
  listId?: string;

  @Expose()
  transactionId?: string;

  @Expose()
  createdAt: string;
}
