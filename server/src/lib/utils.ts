import { prisma } from '../app.js';
import { ExchangeRateApiResponse } from '../types/ExchangeRateApiRes';

export async function updateCurrencyRates() {
  try {
    const fetchRates = await fetch(
      `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_RATE_API_KEY}/latest/USD`,
    );
    const rates: ExchangeRateApiResponse = await fetchRates.json();

    if (rates.result === 'success') {
      const currencies = await prisma.currency.findMany();

      for (const currency of currencies) {
        await prisma.currency.update({
          where: {
            code: currency.code,
          },
          data: {
            rate: rates.conversion_rates[currency.code],
          },
        });
      }
    }
  } catch (error) {
    console.error('Error in scheduled task:', error);
  }
}

export function getStartDateOfCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = '01'; // The first day of the month

  return `${year}-${month}-${day}`;
}

export function getPreviousPeriod(startDateStr: string, endDateStr: string): { startDate: string; endDate: string } {
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  // Function to get the last day of a month
  const getLastDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Check if the date range is for a full year (Jan 1 to Dec 31)
  const isFullYear =
    startDate.getMonth() === 0 && startDate.getDate() === 1 && endDate.getMonth() === 11 && endDate.getDate() === 31;

  if (isFullYear) {
    // Previous year's start and end dates
    const prevYearStartDate = new Date(startDate.getFullYear() - 1, 0, 1); // Jan 1 of the previous year
    const prevYearEndDate = new Date(endDate.getFullYear() - 1, 11, 31); // Dec 31 of the previous year

    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return {
      startDate: formatDate(prevYearStartDate),
      endDate: formatDate(prevYearEndDate),
    };
  }

  // Check if the date range is for a full month (start of the month to the end of the same month)
  const isFullMonth =
    startDate.getDate() === 1 &&
    endDate.getDate() === getLastDayOfMonth(endDate) &&
    startDate.getMonth() === endDate.getMonth();

  if (isFullMonth) {
    // Get the previous month
    const prevMonthEndDate = new Date(startDate.getFullYear(), startDate.getMonth(), 0); // Last day of the previous month
    const prevMonthStartDate = new Date(prevMonthEndDate.getFullYear(), prevMonthEndDate.getMonth(), 1); // First day of the previous month

    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return {
      startDate: formatDate(prevMonthStartDate),
      endDate: formatDate(prevMonthEndDate),
    };
  }

  // If the range spans more than one month, or doesn't match a full month, use periodDuration
  const periodDuration = endDate.getTime() - startDate.getTime();
  const prevEndDate = new Date(startDate.getTime() - 1); // One day before the original start date
  const prevStartDate = new Date(prevEndDate.getTime() - periodDuration);

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return {
    startDate: formatDate(prevStartDate),
    endDate: formatDate(prevEndDate),
  };
}

export function getDateInterval(startDate: Date, endDate: Date): string {
  const timeDiff = endDate.getTime() - startDate.getTime();

  const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

  const daysInMonth = 31;
  const daysInYear = 365;

  if (daysDiff < daysInMonth) {
    return '1 day';
  } else if (daysDiff < 3 * daysInMonth) {
    return '2 days';
  } else if (daysDiff < 6 * daysInMonth) {
    return '3 days';
  } else if (daysDiff < 9 * daysInMonth) {
    return '5 days';
  } else if (daysDiff < 2 * daysInYear) {
    return '1 week';
  } else if (daysDiff < 5 * daysInYear) {
    return '1 month';
  } else {
    return '1 year';
  }
}
