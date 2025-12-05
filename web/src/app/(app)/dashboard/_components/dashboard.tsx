'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import Spinner from '@/components/ui/spinner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAccounts } from '@/hooks/accounts';
import { useCurrencies } from '@/hooks/currencies';
import { useTransactionChartData, useTransactionsByUserId, useTransactionTypes } from '@/hooks/transactions';
import { EXPENSE_ID, INCOME_ID } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import { User } from '@/types/User';
import { ArrowUpRight, Plus } from 'lucide-react';
import Link from 'next/link';
import ValueChart from '../../accounts/[accountId]/_components/value-chart';
import AddTransactionDialog from '../../transactions/_components/add-transaction-dialog';
import TransactionChart from '../../transactions/_components/transaction-chart';
import TransactionList from '../../transactions/_components/transaction-list';
import TransactionCategoryChart from './transaction-category-chart';

interface DashboardProps {
  user: User;
  currentMonth: { startDate: Date; endDate: Date };
  startDate: Date | undefined;
  endDate: Date | undefined;
}

function Dashboard({ user, currentMonth, startDate, endDate }: DashboardProps) {
  const { accountsRes } = useAccounts(startDate);
  const { currencies } = useCurrencies();
  const { transactionsRes } = useTransactionsByUserId(user.id, startDate, endDate);
  const { transactionTypes } = useTransactionTypes();
  const { transactionChartData } = useTransactionChartData(startDate, endDate);

  user.mainCurrency = currencies && currencies.find((currency) => currency.id === user.mainCurrencyId);
  const isLoading = !accountsRes || !currencies || !transactionsRes || !transactionTypes || !transactionChartData;

  return (
    <>
      {isLoading ? (
        <Spinner />
      ) : (
        <main className="flex flex-1 flex-col gap-6 p-4 md:p-6 md:pl-2">
          <div className="flex flex-col items-center space-y-1.5 md:flex-row">
            <div className="mb-2 grid w-full gap-2 pr-6 md:mb-0">
              <h3 className="text-2xl font-semibold leading-none tracking-tight">
                Hello, {user.name?.trim().split(' ')[0]}
              </h3>
              {startDate && endDate ? (
                <p className="text-sm text-muted-foreground">
                  Showing your financial progress from {formatDate(startDate)} to {formatDate(endDate)}.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">Showing your financial progress since inception.</p>
              )}
            </div>
            <div className="flex w-full items-center gap-6 md:ml-auto md:w-auto">
              <DatePickerWithRange></DatePickerWithRange>
            </div>
          </div>
          <div className="grid gap-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <ValueChart
                type="net-worth"
                transactionsRes={transactionsRes}
                currency={user.mainCurrency}
                orientation="vertical"
                startDate={startDate}
                endDate={endDate}
                currentMonth={currentMonth}
                className="md:col-span-2"
                chartClassName="h-36"
              ></ValueChart>
              <TransactionCategoryChart
                typeId={INCOME_ID}
                data={transactionChartData.incomeSumByCategory}
                currency={user.mainCurrency}
                user={user}
              />
              <TransactionCategoryChart
                typeId={EXPENSE_ID}
                data={transactionChartData.expenseSumByCategory}
                currency={user.mainCurrency}
                user={user}
              />
              {/* <AccountChart
                className="hidden md:block"
                typeId={ASSET_ID}
                transactionsRes={transactionsRes}
                currency={user.mainCurrency}
                orientation="vertical"
                startDate={currentMonth.startDate}
                endDate={currentMonth.endDate}
                currentMonth={currentMonth}
              ></AccountChart>
              <AccountChart
                className="hidden md:block"
                typeId={LIABILITY_ID}
                transactionsRes={transactionsRes}
                currency={user.mainCurrency}
                orientation="vertical"
                startDate={currentMonth.startDate}
                endDate={currentMonth.endDate}
                currentMonth={currentMonth}
              ></AccountChart> */}
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <TransactionChart
                typeId={INCOME_ID}
                transactionsRes={transactionsRes}
                currency={user.mainCurrency}
                startDate={startDate}
                endDate={endDate}
                currentMonth={currentMonth}
              />
              <TransactionChart
                typeId={EXPENSE_ID}
                transactionsRes={transactionsRes}
                currency={user.mainCurrency}
                startDate={startDate}
                endDate={endDate}
                currentMonth={currentMonth}
              />
            </div>
          </div>
          <div>
            <Card className="xl:col-span-2" x-chunk="dashboard-01-chunk-4">
              <CardHeader className="flex flex-row items-center gap-2">
                <div className="grid gap-2">
                  <CardTitle>Transactions</CardTitle>
                  <CardDescription>Recent transactions from your accounts.</CardDescription>
                </div>
                <div className="ml-auto flex items-center gap-6">
                  <Button variant="secondary" asChild className="ml-auto hidden gap-1 md:flex">
                    <Link href="/transactions">
                      <span className="hidden md:block">View all</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  {accountsRes.accounts.length > 0 ? (
                    <AddTransactionDialog
                      types={transactionTypes}
                      accounts={accountsRes.accounts}
                      currencies={currencies}
                      user={user}
                    >
                      <Button className="gap-1">
                        <Plus className="h-5 w-5" />
                        <span className="hidden md:block">Add transaction</span>
                      </Button>
                    </AddTransactionDialog>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span tabIndex={0}>
                          <Button className="gap-1" disabled>
                            <Plus className="h-5 w-5" />
                            <span className="hidden md:block">Add transaction</span>
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>You need to add an account first.</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </CardHeader>
              <CardContent className="grid gap-4">
                <TransactionList
                  transactionsRes={transactionsRes}
                  types={transactionTypes}
                  accounts={accountsRes.accounts}
                  currencies={currencies}
                  user={user}
                />
              </CardContent>
            </Card>
          </div>
        </main>
      )}
    </>
  );
}

export default Dashboard;
