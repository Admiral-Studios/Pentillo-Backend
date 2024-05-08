import {
  Exclude,
  Expose,
  Transform,
  Type,
  plainToInstance,
} from 'class-transformer';
import { ContactDto } from '../../../contact/dto/response-dto/contact.dto';

@Exclude()
export class TransactionParticipantResponseDto {
  @Expose()
  id: string;

  @Expose()
  @Type(() => ContactDto)
  goAgent?: ContactDto;

  @Expose()
  @Type(() => ContactDto)
  primaryAgent: ContactDto;

  @Expose()
  @Type(() => ContactDto)
  firstAssistant?: ContactDto;

  @Expose()
  @Type(() => ContactDto)
  secondAssistant?: ContactDto;

  @Expose()
  @Type(() => ContactDto)
  @Transform(
    ({ obj }) =>
      obj?.buyersAndSellers?.map((buyerAndSeller) =>
        plainToInstance(ContactDto, buyerAndSeller.contact),
      ),
  )
  buyersAndSellers?: ContactDto[];
}
