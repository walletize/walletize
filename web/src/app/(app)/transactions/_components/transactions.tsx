'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import Spinner from '@/components/ui/spinner';
import { useAccounts } from '@/hooks/accounts';
import { useCurrencies } from '@/hooks/currencies';
import { useTransactionsByUserId, useTransactionTypes } from '@/hooks/transactions';
import { EXPENSE_ID, INCOME_ID } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import { User } from '@/types/User';
import { Info, Plus } from 'lucide-react';
import Link from 'next/link';
import AddTransactionDialog from '../_components/add-transaction-dialog';
import TransactionChart from '../_components/transaction-chart';
import TransactionList from '../_components/transaction-list';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface TransactionsProps {
  user: User;
  currentMonth: { startDate: Date; endDate: Date };
  startDate: Date | undefined;
  endDate: Date | undefined;
  page: string | undefined;
}

function Transactions({ user, currentMonth, startDate, endDate, page }: TransactionsProps) {
  const { accountsRes } = useAccounts();
  const { currencies } = useCurrencies();
  const { transactionsRes } = useTransactionsByUserId(user.id, startDate, endDate, page);
  const { transactionTypes } = useTransactionTypes();

  const [showMainCurrencyAmount, setShowMainCurrencyAmount] = useState(false);

  user.mainCurrency = currencies && currencies.find((currency) => currency.id === user.mainCurrencyId);
  const isLoading = !accountsRes || !currencies || !transactionsRes || !transactionTypes;

  return (
    <>
      {isLoading ? (
        <Spinner />
      ) : (
        <main className="flex flex-1 flex-col gap-6 p-4 md:p-6 md:pl-2">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex flex-row items-center md:flex-col">
              <div className="grid gap-2 pr-4 md:mb-0 md:pr-6">
                <h3 className="text-2xl font-semibold leading-none tracking-tight">Transactions</h3>
                {startDate && endDate ? (
                  <p className="text-sm text-muted-foreground">
                    Showing your transactions from {formatDate(startDate)} to {formatDate(endDate)}.
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">Showing all of your transactions since inception.</p>
                )}
              </div>
            </div>
            <div className="ml-auto flex w-full flex-col items-center gap-4 md:w-auto md:flex-row">
              <DatePickerWithRange></DatePickerWithRange>
              {accountsRes.accounts.length > 0 ? (
                <AddTransactionDialog
                  types={transactionTypes}
                  accounts={accountsRes.accounts}
                  currencies={currencies}
                  user={user}
                >
                  <Button asChild className="flex w-full gap-1 md:w-auto">
                    <Link href="#">
                      <Plus className="h-5 w-5" />
                      <span className="md:hidden lg:block">Add transaction</span>
                    </Link>
                  </Button>
                </AddTransactionDialog>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span tabIndex={0} className="w-full md:w-auto">
                      <Button className="flex w-full gap-1" disabled>
                        <Plus className="h-5 w-5" />
                        <span>Add transaction</span>
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>You need to add an account first.</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
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
          <Card className="xl:col-span-2" x-chunk="dashboard-01-chunk-4">
            <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="grid gap-2">
                <CardTitle>History</CardTitle>
                <CardDescription>Browse and manage your transactions.</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Switch checked={showMainCurrencyAmount} onCheckedChange={setShowMainCurrencyAmount} />
                <div className="flex items-center gap-1">
                  <p className="text-sm text-muted-foreground">Show amounts in {user.mainCurrency?.code}</p>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-44 text-xs text-muted-foreground md:max-w-sm">
                        Display transaction amounts in your main currency, calculated with the latest daily exchange
                        rates (also used for chart data).
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              <TransactionList
                transactionsRes={transactionsRes}
                types={transactionTypes}
                accounts={accountsRes.accounts}
                currencies={currencies}
                user={user}
                showMainCurrencyAmount={showMainCurrencyAmount}
              ></TransactionList>
            </CardContent>
          </Card>
        </main>
      )}
    </>
  );
}

export default Transactions;
