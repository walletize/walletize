'use client';

import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Tooltip as TooltipComponent, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { calculatePercentageDifference, cn, formatCurrency, formatDate } from '@/lib/utils';
import { Currency } from '@/types/Currency';
import { TransactionsRes } from '@/types/Transaction';
import { Info } from 'lucide-react';
import { Area, AreaChart, ReferenceLine, ResponsiveContainer, Tooltip, TooltipProps, XAxis, YAxis } from 'recharts';

interface ValueChartProps {
  currency?: Currency;
  orientation: 'vertical' | 'horizontal';
  type: 'net-worth' | 'value';
  transactionsRes: TransactionsRes;
  startDate: Date | undefined;
  endDate: Date | undefined;
  currentMonth: {
    startDate: Date;
    endDate: Date;
  };
  className?: string;
  chartClassName?: string;
}

function ValueChart({
  currency,
  orientation,
  type,
  transactionsRes,
  startDate,
  endDate,
  currentMonth,
  className,
  chartClassName,
}: ValueChartProps) {
  const value =
    transactionsRes.chartData.length > 0
      ? transactionsRes.chartData[transactionsRes.chartData.length - 1].cumulativeAmount
      : 0;
  const prevValue =
    type === 'net-worth'
      ? transactionsRes.prevAssetsValue + transactionsRes.prevLiabilitiesValue
      : transactionsRes.prevValue;
  const amountDiff = value - prevValue;
  const percentageDiff = calculatePercentageDifference(prevValue, value);
  const isRanged = startDate && endDate;

  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <Card>
          <div className="p-4 text-sm">
            <p>{formatDate(new Date(label))}</p>
            {payload[0].value != undefined ? (
              <p className="flex items-center justify-end gap-1 font-bold">
                <span className="text-xs text-muted-foreground">
                  {payload[0].value < 0 ? '-' : ''}
                  {currency?.symbol}
                </span>
                <span
                  className={
                    payload[0].value > 0
                      ? 'text-positive'
                      : payload[0].value < 0
                        ? 'text-negative'
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
      if (isRanged) {
        return 'last period';
      } else {
        return 'inception';
      }
    }
  }

  return (
    <Card className={className}>
      <CardContent
        className={'flex h-full !p-0' + (orientation === 'horizontal' ? ' flex-row' : ' flex-col justify-between')}
      >
        <div className="p-4 md:p-6">
          <CardTitle className="pb-2 text-sm font-medium">{type === 'net-worth' ? 'Net worth' : 'Value'}</CardTitle>
          <div className="flex items-center gap-1 text-nowrap text-2xl font-bold">
            <span className="text-sm text-muted-foreground">
              {value < 0 && '-'}
              {currency?.symbol}
            </span>
            {formatCurrency(Math.abs(value))}
          </div>
          <div className="text-xs text-muted-foreground">
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
                        <p className="text-xs text-muted-foreground">{formatDate(transactionsRes.prevEndDate)}</p>
                        <p className="text-xs font-bold text-muted-foreground">
                          {prevValue < 0 ? '-' : ''}
                          {currency?.symbol}
                          {formatCurrency(Math.abs(prevValue))}
                        </p>
                      </TooltipContent>
                    </TooltipComponent>
                  )}
                </span>
              </>
            ) : (
              <>
                <span
                  className={
                    percentageDiff > 0 ? 'text-positive' : percentageDiff < 0 ? 'text-negative' : 'text-foreground/80'
                  }
                >
                  {amountDiff > 0 ? '+' : amountDiff < 0 ? '-' : ''}
                  {currency?.symbol}
                  {formatCurrency(Math.abs(amountDiff))} ({percentageDiff > 0 ? '+' : percentageDiff < 0 ? '-' : ''}
                  {Math.abs(percentageDiff).toFixed(2) + '%'}){' '}
                </span>
                <span className="inline-flex items-center gap-1">
                  from {returnPrevPeriodString()}
                  {isRanged && (
                    <TooltipComponent>
                      <TooltipTrigger>
                        <Info className="h-3 w-3" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs text-muted-foreground">{formatDate(transactionsRes.prevEndDate)}</p>
                        <p className="text-xs font-bold text-muted-foreground">
                          {prevValue < 0 ? '-' : ''}
                          {currency?.symbol}
                          {formatCurrency(Math.abs(prevValue))}
                        </p>
                      </TooltipContent>
                    </TooltipComponent>
                  )}
                </span>
              </>
            )}
          </div>
        </div>
        <div className={cn('mt-auto w-full min-w-0', chartClassName)}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={transactionsRes.chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="netWorthPositiveFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2dba75" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#2dba75" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="netWorthNegativeFill" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="5%" stopColor="#ff3344" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ff3344" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" hide={true} />
              <YAxis hide={true} padding={{ top: 10, bottom: 10 }} domain={[0, 0]}></YAxis>
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="#a1a1a1" strokeOpacity={0.6} strokeDasharray="3 3" />
              <Area
                type="monotone"
                dataKey="cumulativeAmount"
                stroke={
                  percentageDiff > 0 ? '#2dba75' : percentageDiff < 0 ? '#ff3344' : value >= 0 ? '#2dba75' : '#ff3344'
                }
                dot={false}
                fill={
                  percentageDiff > 0
                    ? 'url(#netWorthPositiveFill)'
                    : percentageDiff < 0
                      ? 'url(#netWorthNegativeFill)'
                      : value >= 0
                        ? 'url(#netWorthPositiveFill)'
                        : 'url(#netWorthNegativeFill)'
                }
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default ValueChart;
