import {
  Body,
  Controller,
  UseGuards,
  Post,
  Delete,
  Query,
  Param,
  Get,
  Patch,
  Res,
  Put,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import JwtAuthGuard from '../auth/guards/jwt-auth.guard';
import { User } from '../user/user.decorator';
import { Response } from 'express';

import { CreateTransactionDto } from './dto/request-dto/create-transaction.dto';
import { TransactionService } from './transaction.service';
import { TransactionResponseDto } from './dto/response-dto/transaction-response.dto';
import { ParamsIdsDto } from '../common/dto/params-ids.dto';
import { TransactionListResponse } from './dto/response-dto/transaction-list-response.dto';
import { GetListTransaction } from './dto/request-dto/get-list-transaction.dto';
import { UpdateTransactionDto } from './dto/request-dto/update-transaction.dto';
import { UpdatePayoutDto } from './dto/request-dto/update-payout.dto';
import { TransactionPayoutResponseDto } from './dto/response-dto/transaction-payout-response.dto';
import { IsTransactionExistGuard } from './guards/is-transaction-exist.guard';
import { TransactionParticipantResponseDto } from './dto/response-dto/transaction-participant-response.dto';
import { SelectContactInfo } from '../dal/contact/interfaces/select-contact-info.interface';
import { UpdateParticipantDto } from './dto/request-dto/update-participant.dto';
import { SearchFilterDto } from '../common/dto/search-filter.dto';
import { UserDto } from 'src/user/dto/response-dto/user.dto';

@ApiTags('transaction')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
@ApiCookieAuth()
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @ApiOperation({ summary: 'get transactions address list' })
  @Get('address-list')
  public getTransactionAddressList(
    @User() user: UserDto,
    @Query() filter: SearchFilterDto,
  ): Promise<string[]> {
    return this.transactionService.getTransactionAddressList(
      user.member.teamId,
      filter,
    );
  }

  @ApiOperation({ summary: 'search state list' })
  @Get('search-state-list')
  public getTransactionStateList(
    @User() user: UserDto,
    @Query() filter: SearchFilterDto,
  ): Promise<string[]> {
    return this.transactionService.getTransactionStateList(
      user.member.teamId,
      filter,
    );
  }

  @ApiOperation({ summary: 'get transactions buyers and sellers' })
  @Get('buyers-sellers-list')
  public getTransactionBuyersAndSellers(
    @User() user: UserDto,
    @Query() filter: SearchFilterDto,
  ): Promise<SelectContactInfo[]> {
    return this.transactionService.getTransactionBuyersAndSellers(
      user.member.teamId,
      filter,
    );
  }

  @ApiOperation({ summary: 'export transactions' })
  @Get('export-transactions')
  public async exportTransactions(
    @User() user: UserDto,
    @Query() filter: GetListTransaction,
    @Res() res: Response,
  ): Promise<void> {
    const { csvWriter, records } =
      await this.transactionService.exportTransactions(
        user.member.teamId,
        filter,
      );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=transactions.csv`,
    );

    res.write(csvWriter.getHeaderString());
    res.write(csvWriter.stringifyRecords(records));

    res.end();
  }

  @ApiOperation({ summary: 'get transaction details' })
  @UseGuards(IsTransactionExistGuard)
  @Get(':id')
  public getTransactionDetails(
    @Param('id') id: string,
  ): Promise<TransactionResponseDto> {
    return this.transactionService.getTransactionDetails(id);
  }

  @ApiOperation({ summary: 'get transaction list' })
  @Get()
  public getTransactionList(
    @User() user: UserDto,
    @Query() filter: GetListTransaction,
  ): Promise<TransactionListResponse> {
    return this.transactionService.getTransactionList(
      user.member.teamId,
      filter,
    );
  }

  @ApiOperation({ summary: 'get transaction payout' })
  @UseGuards(IsTransactionExistGuard)
  @Get(':id/transaction-payout')
  public getTransactionPayout(
    @Param('id') id: string,
  ): Promise<TransactionPayoutResponseDto> {
    return this.transactionService.getTransactionPayout(id);
  }

  @ApiOperation({ summary: 'get transaction participant' })
  @UseGuards(IsTransactionExistGuard)
  @Get(':id/transaction-participant')
  public getTransactionParticipant(
    @Param('id') id: string,
  ): Promise<TransactionParticipantResponseDto> {
    return this.transactionService.getTransactionParticipant(id);
  }

  @ApiOperation({ summary: 'update transaction' })
  @UseGuards(IsTransactionExistGuard)
  @Patch('update-transaction/:id')
  public updateTransaction(
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
  ): Promise<TransactionResponseDto> {
    return this.transactionService.updateTransaction(id, dto);
  }

  @ApiOperation({ summary: 'create transaction' })
  @Post('create-transaction')
  public createTransaction(
    @User() user: UserDto,
    @Body() dto: CreateTransactionDto,
  ): Promise<TransactionResponseDto> {
    return this.transactionService.createTransaction(
      user.id,
      user.member.teamId,
      dto,
    );
  }

  @ApiOperation({ summary: 'update transaction payout' })
  @UseGuards(IsTransactionExistGuard)
  @Patch(':id/update-transaction-payout')
  public updateTransactionPayout(
    @Param('id') id: string,
    @Body() dto: UpdatePayoutDto,
  ): Promise<TransactionPayoutResponseDto> {
    return this.transactionService.updateTransactionPayout(id, dto);
  }

  @ApiOperation({ summary: 'update transaction participant' })
  @UseGuards(IsTransactionExistGuard)
  @Put(':id/update-transaction-participant/:participantId')
  public updateTransactionParticipant(
    @Param('id') id: string,
    @Param('participantId') participantId: string,
    @User() user: UserDto,
    @Body() dto: UpdateParticipantDto,
  ): Promise<TransactionParticipantResponseDto> {
    return this.transactionService.updateTransactionParticipant(
      id,
      participantId,
      user.id,
      user.member.teamId,
      dto,
    );
  }

  @ApiOperation({ summary: 'delete transactions' })
  @Delete('delete-transactions')
  public deleteTransactions(@Query() dto: ParamsIdsDto): Promise<void> {
    return this.transactionService.deleteTransactions(dto.ids);
  }
}
