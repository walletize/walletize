export interface ChartData {
  date: Date;
  cumulativeAmount: number;
  cumulativeIncome: number;
  cumulativeExpenses: number;
  cumulativeAssetsTransactions?: number;
  cumulativeLiabilitiesTransactions?: number;
}
