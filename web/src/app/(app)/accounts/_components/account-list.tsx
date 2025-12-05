'use client';

import { ASSET_ID } from '@/lib/constants';
import { FinancialAccount } from '@/types/FinancialAccount';
import AccountRow from './account-row';

interface AccountListProps {
  accounts: FinancialAccount[];
  typeId: string;
}

function AccountList({ accounts, typeId }: AccountListProps) {
  return (
    <>
      <div className="grid grid-cols-3 items-center gap-2 overflow-hidden rounded-lg bg-muted p-4 text-left text-sm font-medium text-muted-foreground md:grid-cols-5">
        <p className="col-span-2">Account</p>
        <p className="hidden md:block">Category</p>
        <p className="hidden md:block">Users</p>
        <p className="text-right">Amount</p>
      </div>
      {accounts.length > 0 ? (
        <div className="grid gap-1 border-b bg-card pb-2 text-card-foreground last:border-b-0">
          {accounts.map((account) => (
            <AccountRow key={account.id} account={account}></AccountRow>
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
