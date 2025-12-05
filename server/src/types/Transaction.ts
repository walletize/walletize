import { ChartData, RawChartData } from './ChartData';
import { Currency } from './Currency';
import { FinancialAccount } from './FinancialAccount';
import { TransactionCategory } from './TransactionCategory';

export interface Transaction {
  id: string;
  description: string;
  date: Date;
  amount: number;
  convertedAccountAmount?: number;
  convertedMainAmount?: number;
  accountId: string;
  currencyId: string;
  recurrenceId?: string;
  financialAccount: FinancialAccount;
  transactionCategory: TransactionCategory;
  currency: Currency;
  createdAt: Date;
  updatedAt: Date;
}

export interface RawTransaction {
  id: string;
  description: string;
  date: string;
  amount: string;
  convertedAccountAmount?: number;
  convertedMainAmount?: number;
  accountId: string;
  currencyId: string;
  recurrenceId?: string;
  financialAccount: FinancialAccount;
  transactionCategory: TransactionCategory;
  currency: Currency;
  createdAt: Date;
  updatedAt: Date;
}

export interface RawGroupedTransaction {
  transactionDate: string;
  totalIncome: number;
  totalExpenses: number;
  assetsValue: number;
  liabilitiesValue: number;
  transactions: RawTransaction[];
}

export interface GroupedTransaction {
  transactionDate: Date;
  totalIncome: number;
  totalExpenses: number;
  assetsValue: number;
  liabilitiesValue: number;
  transactions: Transaction[];
}

export interface RawTransactionsRes {
  prevStartDate: string;
  prevEndDate: string;
  prevIncome: number;
  prevExpenses: number;
  groupedTransactions: RawGroupedTransaction[];
  groupedTransactionsCount: number;
  chartData: RawChartData[];
}

export interface TransactionsRes {
  prevStartDate: Date;
  prevEndDate: Date;
  prevIncome: number;
  prevExpenses: number;
  groupedTransactions: GroupedTransaction[];
  groupedTransactionsCount: number;
  chartData: ChartData[];
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
    chartData: rawTransactionsRes.chartData.map((rawChartData) => ({
      ...rawChartData,
      cumulativeAmount: Number(rawChartData.cumulativeAmount),
      cumulativeIncome: Number(rawChartData.cumulativeIncome),
      cumulativeExpenses: Number(rawChartData.cumulativeExpenses),
      cumulativeAssetsTransactions: Number(rawChartData.cumulativeAssetsTransactions),
      cumulativeLiabilitiesTransactions: Number(rawChartData.cumulativeLiabilitiesTransactions),
    })),
    prevStartDate: new Date(rawTransactionsRes.prevStartDate),
    prevEndDate: new Date(rawTransactionsRes.prevEndDate),
    groupedTransactions,
  };
}
