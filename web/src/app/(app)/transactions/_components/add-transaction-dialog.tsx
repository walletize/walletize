'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { EXPENSE_ID, INCOME_ID, TRANSFER_ID } from '@/lib/constants';
import { Currency } from '@/types/Currency';
import { FinancialAccount } from '@/types/FinancialAccount';
import { TransactionType } from '@/types/TransactionType';
import { User } from '@/types/User';
import React, { useEffect, useState } from 'react';
import TransactionExpenseIncomeForm from './transaction-expense-income-form';
import TransactionTransferForm from './transaction-transfer-form';
import TransactionUpdateForm from './transaction-update-form';

interface AddTransactionDialogProps {
  children: React.ReactNode;
  types: TransactionType[];
  accounts: FinancialAccount[];
  currencies: Currency[];
  account?: FinancialAccount;
  user: User;
}

function AddTransactionDialog({ children, types, accounts, currencies, account, user }: AddTransactionDialogProps) {
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [selectedType, setSelectedType] = useState<TransactionType>(types[0]);

  useEffect(() => {
    if (openAddDialog) {
      setSelectedType(types[0]);
    }
  }, [openAddDialog, types]);

  function renderForm() {
    if (selectedType.id === EXPENSE_ID || selectedType.id === INCOME_ID) {
      return (
        <TransactionExpenseIncomeForm
          types={types}
          accounts={accounts}
          currencies={currencies}
          user={user}
          account={account}
          selectedType={selectedType}
          openOverlay={openAddDialog}
          setOpenOverlay={setOpenAddDialog}
        ></TransactionExpenseIncomeForm>
      );
    } else if (selectedType.id === TRANSFER_ID) {
      return (
        <TransactionTransferForm
          accounts={accounts}
          account={account}
          currencies={currencies}
          user={user}
          openOverlay={openAddDialog}
          setOpenOverlay={setOpenAddDialog}
          types={types}
        ></TransactionTransferForm>
      );
    } else {
      return (
        <TransactionUpdateForm
          accounts={accounts}
          account={account}
          currencies={currencies}
          user={user}
          openOverlay={openAddDialog}
          setOpenOverlay={setOpenAddDialog}
        ></TransactionUpdateForm>
      );
    }
  }

  return (
    <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a new transaction</DialogTitle>
          <DialogDescription>
            Create a new expense, income, transfer or update your account&apos;s value.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="name">Type</Label>
            <ToggleGroup type="single" variant="outline" className="grid grid-cols-4" value={selectedType.id}>
              <ToggleGroupItem value={types[0].id} className="!text-red-500" onClick={() => setSelectedType(types[0])}>
                Expense
              </ToggleGroupItem>
              <ToggleGroupItem
                value={types[1].id}
                className="!text-green-500"
                onClick={() => setSelectedType(types[1])}
              >
                Income
              </ToggleGroupItem>
              <ToggleGroupItem value={types[2].id} className="!text-blue-400" onClick={() => setSelectedType(types[2])}>
                Transfer
              </ToggleGroupItem>
              <ToggleGroupItem
                value={types[3].id}
                className="!text-orange-400"
                onClick={() => setSelectedType(types[3])}
              >
                Update
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          {renderForm()}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AddTransactionDialog;
