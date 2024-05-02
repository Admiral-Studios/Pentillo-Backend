import { Module } from '@nestjs/common';

import { DalModule } from '../dal/dal.module';
import { TransactionNoteController } from './transaction-notes.controller';
import { TransactionNoteService } from './transaction-notes.service';

@Module({
  imports: [DalModule],
  controllers: [TransactionNoteController],
  providers: [TransactionNoteService],
  exports: [TransactionNoteService],
})
export class TransactionNoteModule {}
