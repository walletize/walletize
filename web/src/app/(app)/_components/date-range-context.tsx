'use client';

import { getCurrentMonthPeriod, parseDateParam } from '@/lib/utils';
import { usePathname, useSearchParams } from 'next/navigation';
import React, { createContext, useEffect, useState } from 'react';
import { DateRange } from 'react-day-picker';

export const DateRangeContext = createContext<{
  date: DateRange | undefined;
  setDate: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
}>({ date: { from: new Date(), to: new Date() }, setDate: () => {} });

function DateRangeProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  useEffect(() => {
    if (pathname.includes('/transactions') || pathname.includes('/dashboard') || pathname.includes('/accounts/')) {
      const period = searchParams.get('period');
      const currentMonth = getCurrentMonthPeriod();
      let startDate: Date | undefined = currentMonth.startDate;
      let endDate: Date | undefined = currentMonth.endDate;

      if (period) {
        if (period === 'all') {
          startDate = undefined;
          endDate = undefined;
        } else {
          startDate = new Date(parseDateParam(period).startDate);
          endDate = new Date(parseDateParam(period).endDate);
        }
      }

      setDate({
        from: startDate,
        to: endDate,
      });
    }
  }, [searchParams, pathname]);

  return <DateRangeContext.Provider value={{ date, setDate }}>{children}</DateRangeContext.Provider>;
}

export default DateRangeProvider;
