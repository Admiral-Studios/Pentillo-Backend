import {
  TransactionPropertyType,
  TransactionSideList,
  TransactionSource,
  TransactionStatus,
} from '@prisma/client';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { TransactionDetailsResponseDto } from './transaction-details-response.dto';
import { TransactionContractResponseDto } from './transaction-contract-response.dto';
import { ContactDto } from '../../../contact/dto/response-dto/contact.dto';

@Exclude()
export class TransactionResponseDto {
  @Expose()
  id: string;

  @Expose()
  @Transform(({ value }) => Number(value))
  streetNumber: number;

  @Expose()
  dir: string;

  @Expose()
  street: string;

  @Expose()
  unit?: number;

  @Expose()
  purchase: number;

  @Expose()
  netPurchase?: number;

  @Expose()
  city: string;

  @Expose()
  state: string;

  @Expose()
  zipCode: number;

  @Expose()
  country?: string;

  @Expose()
  listAmount?: number;

  @Expose()
  closedDate?: Date;

  @Expose()
  side: TransactionSideList;

  @Expose()
  source?: TransactionSource;

  @Expose()
  propertyType: TransactionPropertyType;

  @Expose()
  status: TransactionStatus;

  @Expose()
  @Type(() => TransactionDetailsResponseDto)
  details?: TransactionDetailsResponseDto;

  @Expose()
  @Type(() => TransactionContractResponseDto)
  contract?: TransactionContractResponseDto;

  @Expose()
  @Transform(
    ({ obj }) =>
      obj?.participant?.buyersAndSellers?.map(
        (buyerAndSeller) => buyerAndSeller.contact,
      ),
  )
  @Type(() => ContactDto)
  buyersAndSellers?: ContactDto[];

  @Expose()
  @Transform(({ obj }) => obj?.participant?.primaryAgent)
  @Type(() => ContactDto)
  agent?: ContactDto;

  @Expose()
  createdAt: Date;
}
