import { TransactionCategory } from './TransactionCategory';

export interface TransactionType {
  id: string;
  name: string;
  transactionCategories: TransactionCategory[];
}
