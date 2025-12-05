import { Transaction } from './Transaction';

export interface TransactionTransfer {
  id: string;
  originTransactionId?: string;
  destinationTransactionId?: string;
  createdAt: Date;
  updatedAt: Date;
  originTransaction?: Transaction;
  destinationTransaction?: Transaction;
}
