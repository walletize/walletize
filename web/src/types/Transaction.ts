import { ChartData } from './ChartData';
import { Currency } from './Currency';
import { FinancialAccount } from './FinancialAccount';
import { TransactionCategory } from './TransactionCategory';
import { TransactionTransfer } from './TransactionTransfer';
import { User } from './User';

export interface Transaction {
  id: string;
  description: string;
  date: Date;
  amount: number;
  accountCurrencyAmount: number;
  mainCurrencyAmount: number;
  userId: string;
  accountId: string;
  currencyId: string;
  categoryId: string;
  rate?: number;
  recurrenceId?: string;
  user: User;
  financialAccount: FinancialAccount;
  transactionCategory: TransactionCategory;
  currency: Currency;
  transactionTransfer: TransactionTransfer | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RawTransaction {
  id: string;
  description: string;
  date: string;
  amount: string;
  accountCurrencyAmount: number;
  mainCurrencyAmount: number;
  userId: string;
  accountId: string;
  currencyId: string;
  categoryId: string;
  recurrenceId?: string;
  rate?: number;
  user: User;
  financialAccount: FinancialAccount;
  transactionCategory: TransactionCategory;
  currency: Currency;
  transactionTransfer: TransactionTransfer | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RawGroupedTransaction {
  transactionDate: string;
  transactions: RawTransaction[];
}

export interface GroupedTransaction {
  transactionDate: Date;
  transactions: Transaction[];
}

export interface RawTransactionsRes {
  prevStartDate: string;
  prevEndDate: string;
  prevValue: number;
  prevIncome: number;
  prevExpenses: number;
  prevAssetsValue: number;
  prevLiabilitiesValue: number;
  groupedTransactions: RawGroupedTransaction[];
  groupedTransactionsCount: number;
  chartData: ChartData[];
  hiddenTransactionsCount: number;
}

export interface TransactionsRes {
  prevStartDate: Date;
  prevEndDate: Date;
  prevValue: number;
  prevIncome: number;
  prevExpenses: number;
  prevAssetsValue: number;
  prevLiabilitiesValue: number;
  groupedTransactions: GroupedTransaction[];
  groupedTransactionsCount: number;
  chartData: ChartData[];
  hiddenTransactionsCount: number;
}

export function convertRawTransactionsRes(rawTransactionsRes: RawTransactionsRes): TransactionsRes {
  const groupedTransactions: GroupedTransaction[] = rawTransactionsRes.groupedTransactions.map(
    (rawGroupedTransaction) => ({
      ...rawGroupedTransaction,
      transactionDate: new Date(rawGroupedTransaction.transactionDate),
      transactions: rawGroupedTransaction.transactions.map((rawTransaction) => ({
        ...rawTransaction,
        amount: parseInt(rawTransaction.amount),
        date: new Date(rawTransaction.date),
      })),
    }),
  );

  return {
    ...rawTransactionsRes,
    prevStartDate: new Date(rawTransactionsRes.prevStartDate),
    prevEndDate: new Date(rawTransactionsRes.prevEndDate),
    groupedTransactions,
  };
}

export interface TransactionChartData {
  incomeSumByCategory: TransactionCategory[];
  expenseSumByCategory: TransactionCategory[];
}
