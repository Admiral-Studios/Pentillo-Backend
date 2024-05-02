import { Prisma } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { createObjectCsvStringifier } from 'csv-writer';
import { ObjectCsvStringifier } from 'csv-writer/src/lib/csv-stringifiers/object';

import { BadRequestException, Injectable } from '@nestjs/common';
import { EntityManager } from '../dal/entity-manager';
import { CreateTransactionDto } from './dto/request-dto/create-transaction.dto';
import { TransactionResponseDto } from './dto/response-dto/transaction-response.dto';
import { TransactionListResponse } from './dto/response-dto/transaction-list-response.dto';
import { GetListTransaction } from './dto/request-dto/get-list-transaction.dto';
import { UpdateTransactionDto } from './dto/request-dto/update-transaction.dto';
import { UpdatePayoutDto } from './dto/request-dto/update-payout.dto';
import { TransactionPayoutResponseDto } from './dto/response-dto/transaction-payout-response.dto';
import { SelectListFieldsTransform } from '../dal/list/transformations/exclude-list-fields.transform';
import { TransactionParticipantResponseDto } from './dto/response-dto/transaction-participant-response.dto';
import { SelectContactInfo } from '../dal/contact/interfaces/select-contact-info.interface';
import { UpdateParticipantDto } from './dto/request-dto/update-participant.dto';
import { CsvHeadersInterface } from './interfaces/csv-headers.interface';
import { TransactionMapStatus } from './transaction.constants';
import { SearchFilterDto } from '../common/dto/search-filter.dto';

@Injectable()
export class TransactionService {
  constructor(private readonly entityManager: EntityManager) {}

  public async createTransaction(
    userId: string,
    teamId: string,
    dto: CreateTransactionDto,
  ): Promise<TransactionResponseDto> {
    try {
      let listIds: string[] = [];

      return await this.entityManager.transaction(
        async (tx: Prisma.TransactionClient) => {
          if (dto.transaction.templateId) {
            const lists =
              await this.entityManager.listRepository.getListByTemplateId(
                dto.transaction.templateId,
                tx,
              );

            const transformedLists = plainToInstance(
              SelectListFieldsTransform,
              lists,
            );

            listIds = await this.entityManager.listRepository.createManyLists(
              userId,
              transformedLists,
              tx,
            );
          }

          if (dto.participant?.transactionContacts) {
            const transactionContacts = await Promise.all(
              dto.participant.transactionContacts.map((contact) =>
                this.entityManager.contactRepository.createTransactionContact(
                  userId,
                  teamId,
                  contact,
                  tx,
                ),
              ),
            );

            transactionContacts.forEach((contact) =>
              dto.participant.buyerAndSellerIds.push(contact.id),
            );
          }

          const transaction =
            await this.entityManager.transactionRepository.createTransaction(
              userId,
              teamId,
              dto,
              listIds,
              tx,
            );

          return plainToInstance(TransactionResponseDto, transaction);
        },
      );
    } catch (error) {
      throw new BadRequestException('Something went wrong');
    }
  }

  public async deleteTransactions(ids: string[]): Promise<void> {
    await this.entityManager.transactionRepository.deleteTransactions(ids);
  }

  public async getTransactionDetails(
    id: string,
  ): Promise<TransactionResponseDto> {
    const transaction =
      await this.entityManager.transactionRepository.getTransactionById(id);

    return plainToInstance(TransactionResponseDto, transaction);
  }

  public async getTransactionAddressList(
    teamId: string,
    filter: SearchFilterDto,
  ): Promise<string[]> {
    const addressList =
      await this.entityManager.transactionRepository.getTransactionAddressList(
        filter,
        teamId,
      );

    return [
      ...new Set(
        addressList.map((item) => `${item.streetNumber} ${item.street}`),
      ),
    ];
  }

  public async getTransactionStateList(
    teamId: string,
    filter: SearchFilterDto,
  ): Promise<string[]> {
    const stateList =
      await this.entityManager.transactionRepository.getTransactionStateList(
        filter,
        teamId,
      );

    return [...new Set(stateList.map((item) => item.state))];
  }

  public async getTransactionBuyersAndSellers(
    teamId: string,
    filter: SearchFilterDto,
  ): Promise<SelectContactInfo[]> {
    return this.entityManager.contactRepository.getBuyersAndSellers(
      teamId,
      filter,
    );
  }

  public async getTransactionList(
    teamId: string,
    filter: GetListTransaction,
  ): Promise<TransactionListResponse> {
    const data = await this.entityManager.transaction(
      async (tx: Prisma.TransactionClient) => {
        return this.entityManager.transactionRepository.getTransactionList(
          teamId,
          filter,
          tx,
        );
      },
    );

    return plainToInstance(TransactionListResponse, data);
  }

  public async exportTransactions(
    teamId: string,
    filter: GetListTransaction,
  ): Promise<{
    csvWriter: ObjectCsvStringifier;
    records: CsvHeadersInterface[];
  }> {
    const { data } = await this.getTransactionList(teamId, filter);

    const records = data.map((item) => {
      return {
        address: `${item.streetNumber} ${item.street} ${item.city} ${item.state}`,
        price: item.purchase,
        closedDate: item?.closedDate
          ? new Date(item?.closedDate).toLocaleString('en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            })
          : '',
        side: item?.side.toLowerCase(),
        status: TransactionMapStatus[item.status].toLowerCase(),
        agent: `${item.agent?.firstName} ${item.agent?.lastName}`,
      };
    });

    const csvWriter = createObjectCsvStringifier({
      header: [
        { id: 'address', title: 'Address' },
        { id: 'price', title: 'Price' },
        { id: 'closedDate', title: 'Closing' },
        { id: 'status', title: 'Status' },
        { id: 'side', title: 'Side' },
        { id: 'agent', title: 'Agent' },
      ],
    });

    return { csvWriter, records };
  }

  public async updateTransaction(
    id: string,
    dto: UpdateTransactionDto,
  ): Promise<TransactionResponseDto> {
    const fullTransaction =
      await this.entityManager.transactionRepository.updateTransaction(id, dto);

    return plainToInstance(TransactionResponseDto, fullTransaction);
  }

  public async updateTransactionPayout(
    transactionId: string,
    dto: UpdatePayoutDto,
  ): Promise<TransactionPayoutResponseDto> {
    const transactionPayout =
      await this.entityManager.transactionRepository.updateTransactionPayout(
        transactionId,
        dto,
      );

    return plainToInstance(TransactionPayoutResponseDto, transactionPayout);
  }

  public async updateTransactionParticipant(
    transactionId: string,
    participantId: string,
    userId: string,
    teamId: string,
    dto: UpdateParticipantDto,
  ): Promise<TransactionParticipantResponseDto> {
    if (dto?.transactionContacts) {
      const transactionContacts = await Promise.all(
        dto.transactionContacts.map((contact) =>
          this.entityManager.contactRepository.createTransactionContact(
            userId,
            teamId,
            contact,
          ),
        ),
      );

      transactionContacts.forEach((contact) =>
        dto.buyerAndSellerIds.push(contact.id),
      );
    }

    const transactionParticipant =
      await this.entityManager.transactionRepository.updateTransactionParticipant(
        transactionId,
        participantId,
        dto,
      );

    return plainToInstance(
      TransactionParticipantResponseDto,
      transactionParticipant,
    );
  }

  public async getTransactionPayout(
    id: string,
  ): Promise<TransactionPayoutResponseDto> {
    const transactionPayout =
      await this.entityManager.transactionRepository.getTransactionPayout(id);

    console.log(transactionPayout);

    return plainToInstance(TransactionPayoutResponseDto, transactionPayout);
  }

  public async getTransactionParticipant(
    id: string,
  ): Promise<TransactionParticipantResponseDto> {
    const transactionParticipant =
      await this.entityManager.transactionRepository.getTransactionParticipant(
        id,
      );

    return plainToInstance(
      TransactionParticipantResponseDto,
      transactionParticipant,
    );
  }
}
