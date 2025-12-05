import { validateSession } from '@/services/server/auth';
import Account from './_components/account';
import { notFound, redirect, RedirectType } from 'next/navigation';
import { getCurrentMonthPeriod, parseDateParam } from '@/lib/utils';
import { Metadata } from 'next';
import { getFinancialAccount } from '@/services/server/accounts';

export const metadata: Metadata = {
  title: 'Account - Walletize',
  description: 'View and manage your account details.',
  robots: 'noindex',
};

interface AccountPageProps {
  params: { accountId: string };
  searchParams: {
    period?: string;
    page?: string;
  };
}

async function AccountPage({ params, searchParams }: AccountPageProps) {
  const user = await validateSession();
  const account = await getFinancialAccount(params.accountId);
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
  if (!account) {
    notFound();
  }
  if (startDate?.toString() === 'Invalid Date' || endDate?.toString() === 'Invalid Date') {
    redirect('/accounts/' + params.accountId, RedirectType.replace);
  }

  return (
    <Account
      accountId={params.accountId}
      user={user}
      currentMonth={currentMonth}
      startDate={startDate}
      endDate={endDate}
      page={searchParams.page}
    />
  );
}

export default AccountPage;
