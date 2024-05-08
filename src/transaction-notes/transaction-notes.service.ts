import { Injectable } from '@nestjs/common';
import { EntityManager } from '../dal/entity-manager';

import { plainToInstance } from 'class-transformer';
import { TransactionNoteResponseDto } from './dto/response-dto/transaction-notes-response.dto';
import { FilterTransactionNotes } from './dto/request-dto/filter-transaction-notes.dto';

@Injectable()
export class TransactionNoteService {
  constructor(private readonly entityManager: EntityManager) {}

  public async createTransactionNote(
    transactionId: string,
    text: string,
  ): Promise<TransactionNoteResponseDto> {
    const transactionNote =
      await this.entityManager.transactionNotesRepository.createTransactionNote(
        transactionId,
        text,
      );

    return plainToInstance(TransactionNoteResponseDto, transactionNote);
  }

  public async getTransactionNotes(
    transactionId: string,
    filter: FilterTransactionNotes,
  ): Promise<TransactionNoteResponseDto[]> {
    const transactionNotes =
      await this.entityManager.transactionNotesRepository.getTransactionNotes(
        transactionId,
        filter,
      );

    return plainToInstance(TransactionNoteResponseDto, transactionNotes);
  }

  public async updateTransactionNote(
    id: string,
    text: string,
  ): Promise<TransactionNoteResponseDto> {
    const transactionNote =
      await this.entityManager.transactionNotesRepository.updateTransactionNote(
        id,
        text,
      );

    return plainToInstance(TransactionNoteResponseDto, transactionNote);
  }

  public async deleteTransactionNotes(ids: string[]): Promise<void> {
    await this.entityManager.transactionNotesRepository.deleteTransactionNotes(
      ids,
    );
  }
}
