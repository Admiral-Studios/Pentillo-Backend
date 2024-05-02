import {
  Body,
  Controller,
  UseGuards,
  Post,
  Param,
  Get,
  Delete,
  Query,
  Patch,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import JwtAuthGuard from '../auth/guards/jwt-auth.guard';

import { CreateTransactionNoteDto } from './dto/request-dto/create-transaction-note.dto';
import { TransactionNoteService } from './transaction-notes.service';
import { TransactionNoteResponseDto } from './dto/response-dto/transaction-notes-response.dto';
import { ParamsIdsDto } from '../common/dto/params-ids.dto';
import { IsTransactionExistGuard } from '../transaction/guards/is-transaction-exist.guard';
import { IsTransactionNoteExistGuard } from './guards/is-transaction-note-exist.guard';
import { FilterTransactionNotes } from './dto/request-dto/filter-transaction-notes.dto';

@ApiTags('transaction-notes')
@Controller('transaction-notes')
@UseGuards(JwtAuthGuard, IsTransactionExistGuard)
@ApiCookieAuth()
export class TransactionNoteController {
  constructor(
    private readonly transactionNoteService: TransactionNoteService,
  ) {}

  @ApiOperation({ summary: 'get transaction notes' })
  @Get(':transactionId')
  public getTransactionNotes(
    @Param('transactionId') transactionId: string,
    @Query() filter: FilterTransactionNotes,
  ): Promise<TransactionNoteResponseDto[]> {
    return this.transactionNoteService.getTransactionNotes(
      transactionId,
      filter,
    );
  }

  @ApiOperation({ summary: 'create transaction note' })
  @Post(':transactionId/create-note')
  public createTransactionNote(
    @Param('transactionId') transactionId: string,
    @Body() dto: CreateTransactionNoteDto,
  ): Promise<TransactionNoteResponseDto> {
    return this.transactionNoteService.createTransactionNote(
      transactionId,
      dto.text,
    );
  }

  @ApiOperation({ summary: 'update transaction note' })
  @ApiParam({ name: 'transactionId' })
  @UseGuards(IsTransactionNoteExistGuard)
  @Patch(':transactionId/update-note/:noteId')
  public updateTransactionNote(
    @Param('noteId') noteId: string,
    @Body() dto: CreateTransactionNoteDto,
  ): Promise<TransactionNoteResponseDto> {
    return this.transactionNoteService.updateTransactionNote(noteId, dto.text);
  }

  @ApiOperation({ summary: 'delete transaction notes' })
  @ApiParam({ name: 'transactionId' })
  @Delete(':transactionId/delete-notes')
  public deleteTransactionNotes(@Query() dto: ParamsIdsDto): Promise<void> {
    return this.transactionNoteService.deleteTransactionNotes(dto.ids);
  }
}
