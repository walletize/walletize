'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Spinner from '@/components/ui/spinner';
import { useAccountInvites, useAccounts, useAccountTypes } from '@/hooks/accounts';
import { useCurrencies } from '@/hooks/currencies';
import { useTransactionsByUserId } from '@/hooks/transactions';
import { ASSET_ID, LIABILITY_ID } from '@/lib/constants';
import { getCurrentMonthPeriod } from '@/lib/utils';
import { User } from '@/types/User';
import { endOfMonth } from 'date-fns';
import { MailOpen, Plus } from 'lucide-react';
import AccountInvitesDialog from '../[accountId]/_components/account-invites-dialog';
import AccountChart from '../_components/account-chart';
import AddAccountDialog from '../_components/add-account-dialog';
import AccountList from './account-list';

interface AccountsProps {
  user: User;
}

function Accounts({ user }: AccountsProps) {
  const currentMonth = getCurrentMonthPeriod();

  const { accountsRes } = useAccounts(currentMonth.startDate);
  const { currencies } = useCurrencies();
  const { transactionsRes } = useTransactionsByUserId(user.id, currentMonth.startDate, endOfMonth(new Date()));
  const { accountInvites } = useAccountInvites();
  const { accountTypes } = useAccountTypes();

  user.mainCurrency = currencies && currencies.find((currency) => currency.id === user.mainCurrencyId);
  const assetAccounts =
    accountsRes && accountsRes.accounts.filter((account) => account.accountCategory.accountType.id === ASSET_ID);
  const liabilityAccounts =
    accountsRes && accountsRes.accounts.filter((account) => account.accountCategory.accountType.id === LIABILITY_ID);
  const isLoading =
    !accountsRes ||
    !assetAccounts ||
    !liabilityAccounts ||
    !transactionsRes ||
    !accountInvites ||
    !currencies ||
    !accountTypes;

  return (
    <>
      {isLoading ? (
        <Spinner />
      ) : (
        <main className="flex flex-1 flex-col gap-6 p-4 md:p-6 md:pl-2">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="grid gap-2 pr-6">
              <h3 className="text-2xl font-semibold leading-none tracking-tight">Accounts</h3>
              <p className="text-sm text-muted-foreground">Showing all of your assets and liabilities.</p>
            </div>
            <div className="flex gap-4">
              <AccountInvitesDialog accountInvites={accountInvites || []}>
                <Button variant="secondary">
                  <div className="relative">
                    <MailOpen className="h-5 w-5" />
                    {accountInvites && accountInvites.length > 0 && (
                      <Badge className="absolute -right-1 -top-1 p-1"></Badge>
                    )}
                  </div>
                </Button>
              </AccountInvitesDialog>
              <AddAccountDialog types={accountTypes} currencies={currencies} user={user}>
                <Button className="w-full gap-1 md:w-auto">
                  <Plus className="h-5 w-5" />
                  <span>Add account</span>
                </Button>
              </AddAccountDialog>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <AccountChart
              typeId={ASSET_ID}
              transactionsRes={transactionsRes}
              currency={user.mainCurrency}
              orientation="horizontal"
              startDate={currentMonth.startDate}
              endDate={currentMonth.endDate}
              currentMonth={currentMonth}
            ></AccountChart>
            <AccountChart
              typeId={LIABILITY_ID}
              transactionsRes={transactionsRes}
              currency={user.mainCurrency}
              orientation="horizontal"
              startDate={currentMonth.startDate}
              endDate={currentMonth.endDate}
              currentMonth={currentMonth}
            ></AccountChart>
          </div>
          <Card className="xl:col-span-2" x-chunk="dashboard-01-chunk-4">
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Assets</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              <AccountList accounts={assetAccounts} typeId={ASSET_ID}></AccountList>
            </CardContent>
          </Card>
          <Card className="xl:col-span-2" x-chunk="dashboard-01-chunk-4">
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Liabilities</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              <AccountList accounts={liabilityAccounts} typeId={LIABILITY_ID}></AccountList>
            </CardContent>
          </Card>
        </main>
      )}
    </>
  );
}

export default Accounts;
