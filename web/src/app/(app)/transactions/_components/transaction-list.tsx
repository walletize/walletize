'use client';

import { Button } from '@/components/ui/button';
import PaginationSection from '@/components/ui/pagination-section';
import { formatDate } from '@/lib/utils';
import { Currency } from '@/types/Currency';
import { FinancialAccount } from '@/types/FinancialAccount';
import { TransactionsRes } from '@/types/Transaction';
import { TransactionType } from '@/types/TransactionType';
import { User } from '@/types/User';
import { useRouter } from 'next/navigation';
import EditTransactionSheet from './edit-transaction-sheet';
import TransactionRow from './transaction-row';

interface TransactionListProps {
  transactionsRes: TransactionsRes;
  types: TransactionType[];
  accounts: FinancialAccount[];
  account?: FinancialAccount;
  currencies: Currency[];
  user: User;
  showMainCurrencyAmount?: boolean;
  searchTerm?: string;
}

function TransactionList({
  transactionsRes,
  types,
  accounts,
  account,
  currencies,
  user,
  showMainCurrencyAmount,
  searchTerm,
}: TransactionListProps) {
  const router = useRouter();

  function handleShowAllButton() {
    router.replace('?period=all');
  }

  return (
    <div>
      <div className="grid grid-cols-2 items-center overflow-hidden rounded-lg bg-muted p-4 text-left text-sm font-medium text-muted-foreground md:grid-cols-4">
        <p>Category</p>
        <p className="hidden md:block">Description</p>
        <p className="hidden md:block">Account</p>
        <p className="text-right">Amount</p>
      </div>
      <div className="mt-4 flex flex-col gap-4">
        {transactionsRes.groupedTransactions.length > 0 ? (
          transactionsRes.groupedTransactions.map((groupedTransaction) => (
            <div
              key={groupedTransaction.transactionDate.toString()}
              className="grid gap-1 border-b bg-card pb-2 text-card-foreground last:border-b-0"
            >
              <p className="px-4 text-sm font-medium text-muted-foreground">
                {formatDate(new Date(groupedTransaction.transactionDate))}
              </p>
              <div>
                {groupedTransaction.transactions.map((transaction) => (
                  <EditTransactionSheet
                    key={transaction.id}
                    types={types}
                    transaction={transaction}
                    accounts={accounts}
                    currencies={currencies}
                    user={user}
                    account={account}
                  >
                    <TransactionRow
                      transaction={transaction}
                      user={user}
                      showMainCurrencyAmount={showMainCurrencyAmount}
                      highlight={searchTerm}
                    ></TransactionRow>
                  </EditTransactionSheet>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="rounded-lg border border-dashed border-muted py-8 text-center text-sm text-muted-foreground">
            No transactions available.
          </p>
        )}
      </div>
      {transactionsRes.groupedTransactionsCount / 10 > 1 && (
        <div className="mt-2">
          <PaginationSection groupedTransactionsCount={transactionsRes.groupedTransactionsCount} />
        </div>
      )}
      {transactionsRes.hiddenTransactionsCount > 0 && (
        <div className="mt-2 flex items-center justify-center gap-4">
          <p className="text-sm text-muted-foreground">{transactionsRes.hiddenTransactionsCount} transactions hidden</p>
          <Button className="text-sm font-normal text-muted-foreground" variant="outline" onClick={handleShowAllButton}>
            Show all
          </Button>
        </div>
      )}
    </div>
  );
}

export default TransactionList;
