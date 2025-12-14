'use client';

import { Button } from '@/components/ui/button';
import ConfirmDeleteDialog from '@/components/ui/confirm-delete-dialog';
import PaginationSection from '@/components/ui/pagination-section';
import { errorMessages } from '@/lib/messages';
import { formatDate } from '@/lib/utils';
import { Currency } from '@/types/Currency';
import { FinancialAccount } from '@/types/FinancialAccount';
import { TransactionsRes } from '@/types/Transaction';
import { TransactionType } from '@/types/TransactionType';
import { User } from '@/types/User';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { mutate } from 'swr';
import { deleteTransactionsBulk } from '@/services/transactions';
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
  const [selectedTransactionIds, setSelectedTransactionIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const selectAllRef = useRef<HTMLInputElement>(null);

  const flatTransactions = useMemo(
    () =>
      transactionsRes.groupedTransactions.flatMap((groupedTransaction) => groupedTransaction.transactions ?? []),
    [transactionsRes.groupedTransactions],
  );

  useEffect(() => {
    const availableIds = flatTransactions.map((transaction) => transaction.id);
    setSelectedTransactionIds((prev) => new Set(Array.from(prev).filter((id) => availableIds.includes(id))));
  }, [flatTransactions]);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate =
        selectedTransactionIds.size > 0 && selectedTransactionIds.size < flatTransactions.length;
    }
  }, [flatTransactions.length, selectedTransactionIds.size]);

  function handleShowAllButton() {
    router.replace('?period=all');
  }

  function toggleSelectAll(checked: boolean) {
    if (checked) {
      setSelectedTransactionIds(new Set(flatTransactions.map((transaction) => transaction.id)));
      return;
    }
    setSelectedTransactionIds(new Set());
  }

  function toggleTransactionSelection(id: string, checked: boolean) {
    setSelectedTransactionIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }

  async function handleBulkDelete() {
    setBulkDeleting(true);
    const idsToDelete = Array.from(selectedTransactionIds);
    const res = await deleteTransactionsBulk(idsToDelete);

    if (res.ok && res.deleted > 0) {
      toast.success(`Deleted ${res.deleted} transaction${res.deleted > 1 ? 's' : ''}`);
      mutate((key) => typeof key === 'string' && (key.startsWith('/transactions') || key.startsWith('/accounts')));
      const failedIds = new Set<string>((res.failed || []).map((failure: { id: string }) => failure.id as string));
      setSelectedTransactionIds(failedIds);
    }

    if (!res.ok || (res.failed && res.failed.length > 0)) {
      const failureCount = res.failed?.length || 0;
      const message =
        failureCount > 0
          ? `${failureCount} transaction${failureCount > 1 ? 's' : ''} could not be deleted`
          : errorMessages.get(res.message) || errorMessages.get('default');
      toast.error(message);
    }

    setBulkDeleting(false);
  }

  const selectedCount = selectedTransactionIds.size;
  const allSelected = selectedCount > 0 && selectedCount === flatTransactions.length;

  return (
    <div>
      <div
        className={`flex items-center gap-3 overflow-hidden rounded-lg bg-muted text-left text-sm font-medium text-muted-foreground ${selectedCount > 0 ? 'px-4 py-3' : 'p-4'}`}
      >
        <div className="flex items-center">
          <input
            ref={selectAllRef}
            type="checkbox"
            className="h-4 w-4 accent-primary"
            checked={allSelected}
            onChange={(event) => toggleSelectAll(event.target.checked)}
            aria-label="Select all transactions"
          />
        </div>
        <div className="grid flex-1 grid-cols-2 items-center md:grid-cols-4">
          {selectedCount === 0 ? (
            <>
              <p>Category</p>
              <p className="hidden md:block">Description</p>
              <p className="hidden md:block">Account</p>
              <p className="text-right">Amount</p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>{selectedCount} selected</span>
              </div>
              <span className="hidden md:block" />
              <span className="hidden md:block" />
              <div className="flex justify-end">
                <ConfirmDeleteDialog
                  description="the selected transactions"
                  name={`${selectedCount} transaction${selectedCount !== 1 ? 's' : ''}`}
                  onConfirm={handleBulkDelete}
                >
                  <Button size="sm" variant="destructive" className="h-7 px-3 text-xs" disabled={bulkDeleting}>
                    {bulkDeleting ? 'Deleting...' : 'Delete selected'}
                  </Button>
                </ConfirmDeleteDialog>
              </div>
            </>
          )}
        </div>
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
                      selectable
                      selected={selectedTransactionIds.has(transaction.id)}
                      disabled={bulkDeleting}
                      onSelectChange={(checked) => toggleTransactionSelection(transaction.id, checked)}
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
