import { TransactionWithContactInclude } from '../types/transaction-contact-include.type';

export interface GetListTransactionInterface {
  data: TransactionWithContactInclude[];
  count: number;
}
