'use client';

import {
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subMonths,
  subWeeks,
  subYears,
} from 'date-fns';
import { Calendar as CalendarIcon, RotateCcw } from 'lucide-react';

import { DateRangeContext } from '@/app/(app)/_components/date-range-context';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn, formatDateParam } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useContext, useState } from 'react';
import { DateRange } from 'react-day-picker';

export function DatePickerWithRange({ className }: { className?: string }) {
  const { date } = useContext(DateRangeContext);
  const [month, setMonth] = useState(date?.from);
  const router = useRouter();

  const handleDateSelect = (date: DateRange) => {
    if (date.from && date.to) {
      const groupedTransactionsParams = new URLSearchParams();
      groupedTransactionsParams.append('period', formatDateParam(date.from, date.to));
      router.replace('?' + groupedTransactionsParams);
      if (groupedTransactionsParams.size === 0) {
        router.refresh();
      }
    }
  };

  const handlePresetSelect = (preset: string) => {
    let dateRange: DateRange | undefined = {
      from: undefined,
      to: undefined,
    };
    const now = new Date();

    if (preset === 'thisWeek') {
      dateRange = {
        from: startOfWeek(now),
        to: endOfWeek(now),
      };
    } else if (preset === 'lastWeek') {
      dateRange = {
        from: startOfWeek(subWeeks(now, 1)),
        to: endOfWeek(subWeeks(now, 1)),
      };
    } else if (preset === 'thisMonth') {
      dateRange = {
        from: startOfMonth(now),
        to: endOfMonth(now),
      };
    } else if (preset === 'lastMonth') {
      dateRange = {
        from: startOfMonth(subMonths(now, 1)),
        to: endOfMonth(subMonths(now, 1)),
      };
    } else if (preset === 'thisYear') {
      dateRange = {
        from: startOfYear(now),
        to: endOfYear(now),
      };
    } else if (preset === 'lastYear') {
      dateRange = {
        from: startOfYear(subYears(now, 1)),
        to: endOfYear(subYears(now, 1)),
      };
    } else {
      dateRange = undefined;
    }

    const groupedTransactionsParams = new URLSearchParams();
    if (dateRange && dateRange.from && dateRange.to) {
      if (preset !== 'thisMonth') {
        groupedTransactionsParams.append('period', formatDateParam(dateRange.from, dateRange.to));
      }
    } else if (dateRange === undefined) {
      groupedTransactionsParams.append('period', 'all');
    }
    setMonth(dateRange?.to);
    router.replace('?' + groupedTransactionsParams);
    if (groupedTransactionsParams.size === 0) {
      router.refresh();
    }
  };

  function handleResetButton() {
    router.replace('?');
    router.refresh();
  }

  return (
    <div className={cn('flex w-full gap-2 md:w-auto', className)}>
      <Button variant="secondary" className="px-3" onClick={handleResetButton}>
        <RotateCcw className="h-4.5 w-4.5" />
      </Button>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn('w-full justify-start text-left font-normal md:w-fit lg:w-[300px]')}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'dd LLL y')} - {format(date.to, 'dd LLL y')}
                </>
              ) : (
                format(date.from, 'dd LLL y')
              )
            ) : (
              <span>All history</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="flex w-auto p-0" side="bottom" align="end">
          <div className="flex flex-col p-3 pr-0">
            <Button className="justify-start" variant="ghost" onClick={() => handlePresetSelect('thisWeek')}>
              This week
            </Button>
            <Button className="justify-start" variant="ghost" onClick={() => handlePresetSelect('lastWeek')}>
              Last week
            </Button>
            <Button className="justify-start" variant="ghost" onClick={() => handlePresetSelect('thisMonth')}>
              This month
            </Button>
            <Button className="justify-start" variant="ghost" onClick={() => handlePresetSelect('lastMonth')}>
              Last month
            </Button>
            <Button className="justify-start" variant="ghost" onClick={() => handlePresetSelect('thisYear')}>
              This year
            </Button>
            <Button className="justify-start" variant="ghost" onClick={() => handlePresetSelect('lastYear')}>
              Last year
            </Button>
            <Button className="justify-start" variant="ghost" onClick={() => handlePresetSelect('allHistory')}>
              All history
            </Button>
          </div>
          <Calendar
            mode="range"
            month={month}
            onMonthChange={setMonth}
            selected={date}
            onSelect={handleDateSelect}
            numberOfMonths={2}
            required
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
