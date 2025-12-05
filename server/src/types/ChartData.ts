export interface ChartData {
  date: Date;
  cumulativeAmount: number;
  cumulativeIncome: number;
  cumulativeExpenses: number;
  cumulativeAssetsTransactions?: number;
  cumulativeLiabilitiesTransactions?: number;
}

export interface RawChartData {
  date: Date;
  cumulativeAmount: string;
  cumulativeIncome: string;
  cumulativeExpenses: string;
  cumulativeAssetsTransactions?: string;
  cumulativeLiabilitiesTransactions?: string;
}
