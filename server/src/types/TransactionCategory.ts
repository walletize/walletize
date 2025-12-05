import { TransactionType } from './TransactionType';

export interface TransactionCategory {
  id: string;
  name: string;
  typeId: string;
  transactionType: TransactionType;
  icon: string;
  color: string;
  iconColor: string;
}
