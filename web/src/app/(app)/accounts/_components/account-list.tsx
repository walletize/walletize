'use client';

import { Button } from '@/components/ui/button';
import ConfirmDeleteDialog from '@/components/ui/confirm-delete-dialog';
import { ASSET_ID } from '@/lib/constants';
import { errorMessages } from '@/lib/messages';
import { FinancialAccount } from '@/types/FinancialAccount';
import { useEffect, useRef, useState } from 'react';
import { mutate } from 'swr';
import { deleteFinancialAccountsBulk } from '@/services/accounts';
import { toast } from 'sonner';
import AccountRow from './account-row';

interface AccountListProps {
  accounts: FinancialAccount[];
  typeId: string;
}

function AccountList({ accounts, typeId }: AccountListProps) {
  const [selectedAccountIds, setSelectedAccountIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const selectAllRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const availableIds = accounts.map((account) => account.id);
    setSelectedAccountIds((prev) => new Set(Array.from(prev).filter((id) => availableIds.includes(id))));
  }, [accounts]);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = selectedAccountIds.size > 0 && selectedAccountIds.size < accounts.length;
    }
  }, [accounts.length, selectedAccountIds.size]);

  function toggleSelectAll(checked: boolean) {
    if (checked) {
      setSelectedAccountIds(new Set(accounts.map((account) => account.id)));
      return;
    }
    setSelectedAccountIds(new Set());
  }

  function toggleAccountSelection(id: string, checked: boolean) {
    setSelectedAccountIds((prev) => {
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
    const idsToDelete = Array.from(selectedAccountIds);
    const res = await deleteFinancialAccountsBulk(idsToDelete);

    if (res.ok && res.deleted > 0) {
      toast.success(`Deleted ${res.deleted} account${res.deleted > 1 ? 's' : ''}`);
      mutate((key) => typeof key === 'string' && (key.startsWith('/accounts') || key.startsWith('/transactions')));
      const failedIds = new Set<string>((res.failed || []).map((failure: { id: string }) => failure.id as string));
      setSelectedAccountIds(failedIds);
    }

    if (!res.ok || (res.failed && res.failed.length > 0)) {
      const failureCount = res.failed?.length || 0;
      const message =
        failureCount > 0
          ? `${failureCount} account${failureCount > 1 ? 's' : ''} could not be deleted`
          : errorMessages.get(res.message) || errorMessages.get('default');
      toast.error(message);
    }

    setBulkDeleting(false);
  }

  const selectedCount = selectedAccountIds.size;
  const allSelected = selectedCount > 0 && selectedCount === accounts.length;

  return (
    <>
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
            aria-label="Select all accounts"
          />
        </div>
        <div className="grid flex-1 grid-cols-3 items-center gap-2 md:grid-cols-5">
          {selectedCount === 0 ? (
            <>
              <p className="col-span-2">Account</p>
              <p className="hidden md:block">Category</p>
              <p className="hidden md:block">Users</p>
              <p className="text-right">Amount</p>
            </>
          ) : (
            <>
              <div className="col-span-2 flex items-center gap-2 text-muted-foreground">
                <span>{selectedCount} selected</span>
              </div>
              <span className="hidden md:block" />
              <span className="hidden md:block" />
              <div className="flex justify-end">
                <ConfirmDeleteDialog
                  description="the selected accounts"
                  name={`${selectedCount} account${selectedCount !== 1 ? 's' : ''}`}
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
      {accounts.length > 0 ? (
        <div className="grid gap-1 border-b bg-card pb-2 text-card-foreground last:border-b-0">
          {accounts.map((account) => (
            <AccountRow
              key={account.id}
              account={account}
              selectable
              selected={selectedAccountIds.has(account.id)}
              disabled={bulkDeleting}
              onSelectChange={(checked) => toggleAccountSelection(account.id, checked)}
            ></AccountRow>
          ))}
        </div>
      ) : (
        <p className="border border-dashed py-8 text-center text-sm text-muted-foreground">
          No {typeId === ASSET_ID ? 'asset' : 'liability'} accounts available.
        </p>
      )}
    </>
  );
}

export default AccountList;
