import { validateSession } from '@/services/server/auth';
import Dashboard from './_components/dashboard';
import { getCurrentMonthPeriod, parseDateParam } from '@/lib/utils';
import { redirect, RedirectType } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - Walletize',
  description: 'Visualize your financial journey and manage your money.',
  robots: 'noindex',
};

interface DashboardPageProps {
  searchParams: {
    period?: string;
  };
}

async function DashboardPage({ searchParams }: DashboardPageProps) {
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
    redirect('/dashboard', RedirectType.replace);
  }

  return <Dashboard user={user} currentMonth={currentMonth} startDate={startDate} endDate={endDate} />;
}

export default DashboardPage;
