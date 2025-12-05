import { validateSession } from '@/services/server/auth';
import Transactions from './_components/transactions';
import { getCurrentMonthPeriod, parseDateParam } from '@/lib/utils';
import { RedirectType } from 'next/navigation';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Transactions - Walletize',
  description: 'View and manage your income and expenses.',
  robots: 'noindex',
};

interface TransactionsPageProps {
  searchParams: {
    period?: string;
    page?: string;
  };
}

async function TransactionsPage({ searchParams }: TransactionsPageProps) {
  const user = await validateSession();
  const currentMonth = getCurrentMonthPeriod();
  let startDate: Date | undefined = currentMonth.startDate;
  let endDate: Date | undefined = currentMonth.endDate;
  if (searchParams.period) {
    if (searchParams.period === 'all') {
      startDate = undefined;
      endDate = undefined;
    } else {
      startDate = new Date(parseDateParam(searchParams.period).startDate);
      endDate = new Date(parseDateParam(searchParams.period).endDate);
    }
  }
  if (startDate?.toString() === 'Invalid Date' || endDate?.toString() === 'Invalid Date') {
    redirect('/transactions', RedirectType.replace);
  }

  return (
    <Transactions
      user={user}
      currentMonth={currentMonth}
      startDate={startDate}
      endDate={endDate}
      page={searchParams.page}
    />
  );
}

export default TransactionsPage;
