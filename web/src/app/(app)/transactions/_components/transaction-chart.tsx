'use client';

import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Tooltip as TooltipComponent, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { INCOME_ID } from '@/lib/constants';
import { calculatePercentageDifference, cn, formatCurrency, formatDate } from '@/lib/utils';
import { Currency } from '@/types/Currency';
import { TransactionsRes } from '@/types/Transaction';
import { Info } from 'lucide-react';
import { Area, AreaChart, ReferenceLine, ResponsiveContainer, Tooltip, TooltipProps, XAxis, YAxis } from 'recharts';

interface TransactionChartProps {
  typeId: string;
  transactionsRes: TransactionsRes;
  currency?: Currency;
  startDate: Date | undefined;
  endDate: Date | undefined;
  currentMonth: {
    startDate: Date;
    endDate: Date;
  };
}

function TransactionChart({
  typeId,
  transactionsRes,
  currency,
  startDate,
  endDate,
  currentMonth,
}: TransactionChartProps) {
  const totalIncome =
    transactionsRes.chartData.length > 0
      ? transactionsRes.chartData[transactionsRes.chartData.length - 1].cumulativeIncome
      : 0;
  const totalExpenses =
    transactionsRes.chartData.length > 0
      ? transactionsRes.chartData[transactionsRes.chartData.length - 1].cumulativeExpenses
      : 0;
  const totalAmount = transactionsRes.chartData.length > 0 ? (typeId === INCOME_ID ? totalIncome : totalExpenses) : 0;
  const prevAmount = typeId === INCOME_ID ? transactionsRes.prevIncome : Math.abs(transactionsRes.prevExpenses);
  const amountDiff = totalAmount - prevAmount;
  const percentageDiff = calculatePercentageDifference(prevAmount, totalAmount);
  const isRanged = startDate && endDate;

  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <Card>
          <div className="p-4 text-sm">
            <p>{formatDate(new Date(label))}</p>
            {payload[0].value != undefined ? (
              <p className="flex items-center gap-1 font-bold">
                <span className="text-xs text-muted-foreground">
                  {payload[0].value < 0 && '-'}
                  {currency?.symbol}
                </span>
                <span
                  className={
                    payload[0].value > 0
                      ? typeId === INCOME_ID
                        ? 'text-positive'
                        : 'text-negative'
                      : payload[0].value < 0
                        ? typeId === INCOME_ID
                          ? 'text-negative'
                          : 'text-positive'
                        : 'text-foreground/80'
                  }
                >
                  {formatCurrency(Math.abs(payload[0].value))}
                </span>
              </p>
            ) : (
              <p className="text-muted-foreground">No data found</p>
            )}
          </div>
        </Card>
      );
    }

    return null;
  };

  function returnPrevPeriodString() {
    if (
      startDate?.toDateString() === currentMonth.startDate.toDateString() &&
      endDate?.toDateString() === currentMonth.endDate.toDateString()
    ) {
      return 'last month';
    } else {
      return 'last period';
    }
  }

  return (
    <Card>
      <CardContent className="flex !p-0">
        <div className="p-4 md:p-6">
          <CardTitle className="pb-2 text-sm font-medium">{typeId === INCOME_ID ? 'Income' : 'Expenses'}</CardTitle>
          <div className="flex items-center gap-1 text-nowrap text-2xl font-bold">
            <span className="text-sm text-muted-foreground">
              {totalAmount < 0 && '-'}
              {currency?.symbol}
            </span>
            {formatCurrency(Math.abs(totalAmount))}
          </div>
          <div className="flex flex-col text-xs text-muted-foreground">
            {percentageDiff === Infinity || percentageDiff === -Infinity || Number.isNaN(percentageDiff) ? (
              <>
                <span>No data found </span>
                <span className="inline-flex items-center gap-1 text-nowrap">
                  from {returnPrevPeriodString()}
                  {isRanged && (
                    <TooltipComponent>
                      <TooltipTrigger>
                        <Info className="h-3 w-3" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(transactionsRes.prevStartDate)} - {formatDate(transactionsRes.prevEndDate)}
                        </p>
                        <p className="text-xs font-bold text-muted-foreground">
                          {currency?.symbol}
                          {formatCurrency(Math.abs(prevAmount))}
                        </p>
                      </TooltipContent>
                    </TooltipComponent>
                  )}
                </span>
              </>
            ) : (
              <>
                <span
                  className={cn(
                    'text-nowrap',
                    typeId === INCOME_ID
                      ? percentageDiff > 0
                        ? 'text-positive'
                        : percentageDiff < 0
                          ? 'text-negative'
                          : 'text-foreground/80'
                      : percentageDiff > 0
                        ? 'text-negative'
                        : percentageDiff < 0
                          ? 'text-positive'
                          : 'text-foreground/80',
                  )}
                >
                  {amountDiff > 0 ? '+' : amountDiff < 0 ? '-' : ''}
                  {currency?.symbol}
                  {formatCurrency(Math.abs(amountDiff))} ({percentageDiff > 0 ? '+' : percentageDiff < 0 ? '-' : ''}
                  {Math.abs(percentageDiff).toFixed(2) + '%'}){' '}
                </span>
                <span className="inline-flex items-center gap-1 text-nowrap">
                  from {returnPrevPeriodString()}
                  <TooltipComponent>
                    <TooltipTrigger>
                      <Info className="h-3 w-3" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(transactionsRes.prevStartDate)} - {formatDate(transactionsRes.prevEndDate)}
                      </p>
                      <p className="text-xs font-bold text-muted-foreground">
                        {currency?.symbol}
                        {formatCurrency(Math.abs(prevAmount))}
                      </p>
                    </TooltipContent>
                  </TooltipComponent>
                </span>
              </>
            )}
          </div>
        </div>
        <div className="h-32 w-full min-w-0 md:h-36">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={transactionsRes.chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="transactionPositiveFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2dba75" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#2dba75" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="transactionNegativeFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff3344" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ff3344" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" hide={true} />
              <YAxis
                hide={true}
                padding={{ top: 10, bottom: 10 }}
                domain={[0, Math.max(totalIncome, totalExpenses)]}
              ></YAxis>
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="#a1a1a1" strokeOpacity={0.6} strokeDasharray="3 3" />
              <Area
                type="monotone"
                dataKey={typeId === INCOME_ID ? 'cumulativeIncome' : 'cumulativeExpenses'}
                stroke={typeId === INCOME_ID ? '#2dba75' : '#ff3344'}
                dot={false}
                fill={typeId === INCOME_ID ? 'url(#transactionPositiveFill)' : 'url(#transactionNegativeFill)'}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default TransactionChart;
