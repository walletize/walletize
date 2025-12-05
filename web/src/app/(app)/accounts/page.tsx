import { validateSession } from '@/services/server/auth';
import Accounts from './_components/accounts';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Accounts - Walletize',
  description: 'View and manage your assets and liabilities.',
  robots: 'noindex',
};

async function AccountsPage() {
  const user = await validateSession();

  return <Accounts user={user} />;
}

export default AccountsPage;
