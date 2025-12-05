'use client';

import AddTransactionDialog from '@/app/(app)/transactions/_components/add-transaction-dialog';
import TransactionChart from '@/app/(app)/transactions/_components/transaction-chart';
import TransactionList from '@/app/(app)/transactions/_components/transaction-list';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import Spinner from '@/components/ui/spinner';
import { Tooltip as TooltipComponent, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAccount, useAccounts, useAccountTypes } from '@/hooks/accounts';
import { useCurrencies } from '@/hooks/currencies';
import { useTransactionsByAccountId, useTransactionTypes } from '@/hooks/transactions';
import { EXPENSE_ID, INCOME_ID } from '@/lib/constants';
import { cn, formatCurrency, getInitials } from '@/lib/utils';
import { InviteStatus } from '@/types/AccountInvite';
import { User } from '@/types/User';
import { Pencil, Plus, User as UserIcon } from 'lucide-react';
import Image from 'next/image';
import EditAccountSheet from '../../_components/edit-account-sheet';
import LeaveAccountDialog from './leave-account-dialog';
import ValueChart from './value-chart';

interface AccountProps {
  accountId: string;
  user: User;
  currentMonth: { startDate: Date; endDate: Date };
  startDate: Date | undefined;
  endDate: Date | undefined;
  page: string | undefined;
}

function Account({ accountId, user, currentMonth, startDate, endDate, page }: AccountProps) {
  const { account } = useAccount(accountId);
  const { accountsRes } = useAccounts();
  const { currencies } = useCurrencies();
  const { transactionsRes } = useTransactionsByAccountId(accountId, startDate, endDate, page);
  const { transactionTypes } = useTransactionTypes();
  const { accountTypes } = useAccountTypes();

  user.mainCurrency = currencies && currencies.find((currency) => currency.id === user.mainCurrencyId);
  const isLoading = !account || !currencies || !transactionsRes || !transactionTypes || !accountTypes || !accountsRes;

  return (
    <>
      {isLoading ? (
        <Spinner />
      ) : (
        <main className="flex flex-1 flex-col gap-6 p-4 md:p-6 md:pl-2">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <Avatar className="flex h-12 w-12 items-center justify-center">
                <AvatarFallback style={{ backgroundColor: account.color }}>
                  <div className="flex h-7 w-7 items-center justify-center">
                    <Image
                      src={'/icons/' + account.icon}
                      width={0}
                      height={0}
                      sizes="100vw"
                      style={{ width: 'auto', height: 'auto' }}
                      alt="Walletize Logo"
                      className={account.iconColor === 'white' ? 'invert' : ''}
                    />
                  </div>
                </AvatarFallback>
              </Avatar>
              <div className="grid gap-1 pr-6">
                <h3 className="truncate text-2xl font-semibold leading-none tracking-tight">{account.name}</h3>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm text-muted-foreground">{account.accountCategory.name}</p>
                  {account.accountInvites.length > 0 && (
                    <TooltipComponent>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-accent-foreground"
                        >
                          <UserIcon className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <div className="flex flex-col gap-2">
                          <div className="col-span-2 flex items-center gap-3">
                            <Avatar className="flex h-7 w-7 items-center justify-center">
                              <AvatarFallback className="text-xs font-normal">
                                {account.user.email ? getInitials(account.user.email) : '-'}
                              </AvatarFallback>
                            </Avatar>
                            <p className="text-sm font-bold">
                              {account.user.email} <span className="text-sm text-muted-foreground">(owner)</span>
                            </p>
                          </div>
                          {account.accountInvites.map((accountInvite) => (
                            <div key={accountInvite.email} className="col-span-2 flex items-center gap-3">
                              <Avatar className="flex h-7 w-7 items-center justify-center">
                                <AvatarFallback
                                  className={cn(
                                    'text-xs font-normal',
                                    accountInvite.status === InviteStatus.PENDING
                                      ? 'bg-muted/50 text-foreground/50'
                                      : '',
                                  )}
                                >
                                  {getInitials(accountInvite.email)}
                                </AvatarFallback>
                              </Avatar>
                              <p className="text-sm">
                                {accountInvite.email}{' '}
                                {accountInvite.status === InviteStatus.PENDING && (
                                  <span className="text-sm text-muted-foreground">(pending)</span>
                                )}
                              </p>
                            </div>
                          ))}
                        </div>
                      </TooltipContent>
                    </TooltipComponent>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4 md:ml-auto lg:flex-row lg:items-center">
              <DatePickerWithRange></DatePickerWithRange>
              <div className="flex items-center gap-2 md:gap-4">
                {account.userId !== user.id ? (
                  <LeaveAccountDialog account={account} />
                ) : (
                  <EditAccountSheet types={accountTypes} account={account} user={user} currencies={currencies}>
                    <Button
                      className="w-full gap-1 lg:w-auto"
                      variant="secondary"
                      disabled={account.userId !== user.id}
                    >
                      <Pencil className="h-5 w-5" />
                      <span className="inline md:hidden xl:inline">Edit account</span>
                    </Button>
                  </EditAccountSheet>
                )}
                <AddTransactionDialog
                  types={transactionTypes}
                  accounts={accountsRes.accounts}
                  currencies={currencies}
                  account={account}
                  user={user}
                >
                  <Button className="w-full gap-1 lg:w-auto">
                    <Plus className="h-5 w-5" />
                    <span className="inline md:hidden xl:inline">Add transaction</span>
                  </Button>
                </AddTransactionDialog>
              </div>
            </div>
          </div>
          <ValueChart
            type="value"
            transactionsRes={transactionsRes}
            currency={account.currency}
            orientation="vertical"
            startDate={startDate}
            endDate={endDate}
            currentMonth={currentMonth}
            chartClassName="h-80"
          ></ValueChart>
          <div className="grid gap-6 md:grid-cols-2">
            <TransactionChart
              typeId={INCOME_ID}
              transactionsRes={transactionsRes}
              currency={account.currency}
              startDate={startDate}
              endDate={endDate}
              currentMonth={currentMonth}
            />
            <TransactionChart
              typeId={EXPENSE_ID}
              transactionsRes={transactionsRes}
              currency={account.currency}
              startDate={startDate}
              endDate={endDate}
              currentMonth={currentMonth}
            />
          </div>
          {accountTypes && account && account.initialValue !== 0 && (
            <Card>
              <CardContent className="grid gap-4 !pb-0">
                <EditAccountSheet types={accountTypes} account={account} user={user} currencies={currencies}>
                  <div className="grid gap-1 bg-card py-2 text-card-foreground">
                    <div className="-mx-3 grid grid-cols-2 items-center overflow-hidden rounded-lg px-3 py-3 text-left text-sm font-medium transition-colors hover:cursor-pointer hover:bg-muted">
                      <p className="flex items-center gap-4">
                        <Avatar className="hidden h-9 w-9 sm:flex">
                          <AvatarFallback>{account.initialValue > 0 ? '+' : '-'}</AvatarFallback>
                        </Avatar>
                        Initial value
                      </p>
                      <p className="flex items-center justify-end gap-1 font-bold">
                        <span className="text-xs text-muted-foreground">
                          {account.initialValue < 0 ? '-' : ''}
                          {account.currency.symbol}
                        </span>
                        <span
                          className={
                            account.initialValue > 0 ? 'text-positive' : account.initialValue < 0 ? 'text-negative' : ''
                          }
                        >
                          {formatCurrency(Math.abs(account.initialValue))}
                        </span>
                      </p>
                    </div>
                  </div>
                </EditAccountSheet>
              </CardContent>
            </Card>
          )}

          <Card className="xl:col-span-2">
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>History</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              <TransactionList
                transactionsRes={transactionsRes}
                types={transactionTypes}
                accounts={accountsRes.accounts}
                account={account}
                currencies={currencies}
                user={user}
              ></TransactionList>
            </CardContent>
          </Card>
        </main>
      )}
    </>
  );
}

export default Account;
