'use client';

import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { EXPENSE_ID, INCOME_ID, TRANSFER_ID } from '@/lib/constants';
import { Currency } from '@/types/Currency';
import { FinancialAccount } from '@/types/FinancialAccount';
import { Transaction } from '@/types/Transaction';
import { TransactionType } from '@/types/TransactionType';
import { User } from '@/types/User';
import React, { useState } from 'react';
import TransactionExpenseIncomeForm from './transaction-expense-income-form';
import TransactionTransferForm from './transaction-transfer-form';
import TransactionUpdateForm from './transaction-update-form';

interface EditTransactionSheetProps {
  types: TransactionType[];
  transaction: Transaction;
  accounts: FinancialAccount[];
  children: React.ReactNode;
  currencies: Currency[];
  user: User;
  account?: FinancialAccount;
}

function EditTransactionSheet({
  types,
  transaction,
  accounts,
  children,
  user,
  currencies,
  account,
}: EditTransactionSheetProps) {
  const [openEditSheet, setOpenEditSheet] = useState(false);
  const transactionType = transaction.transactionTransfer
    ? types[2]
    : types.find((type) => type.id === transaction.transactionCategory.typeId);
  const [selectedType, setSelectedType] = useState<TransactionType>(transactionType || types[0]);

  function renderForm() {
    if ((selectedType.id === EXPENSE_ID || selectedType.id === INCOME_ID) && !transaction.transactionTransfer) {
      return (
        <TransactionExpenseIncomeForm
          types={types}
          accounts={accounts}
          currencies={currencies}
          user={user}
          account={account}
          selectedType={selectedType}
          openOverlay={openEditSheet}
          setOpenOverlay={setOpenEditSheet}
          transaction={transaction}
        ></TransactionExpenseIncomeForm>
      );
    } else if (selectedType.id === TRANSFER_ID || transaction.transactionTransfer) {
      return (
        <TransactionTransferForm
          accounts={accounts}
          account={account}
          currencies={currencies}
          user={user}
          openOverlay={openEditSheet}
          setOpenOverlay={setOpenEditSheet}
          transaction={transaction}
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
          openOverlay={openEditSheet}
          setOpenOverlay={setOpenEditSheet}
          transaction={transaction}
        ></TransactionUpdateForm>
      );
    }
  }

  return (
    <Sheet open={openEditSheet} onOpenChange={setOpenEditSheet}>
      <SheetTrigger className="w-full">{children}</SheetTrigger>
      <SheetContent className="flex w-screen flex-col sm:w-3/4 sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Edit transaction</SheetTitle>
          <SheetDescription>Modify the details of your transaction.</SheetDescription>
        </SheetHeader>
        <div className="grid gap-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="name">Type</Label>
            {transaction ? (
              (selectedType.id === INCOME_ID || selectedType.id === EXPENSE_ID) && !transaction.transactionTransfer ? (
                <ToggleGroup type="single" variant="outline" className="grid grid-cols-2" value={selectedType.id}>
                  <ToggleGroupItem
                    value={types[0].id}
                    className="!text-red-500"
                    onClick={() => setSelectedType(types[0])}
                  >
                    Expense
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value={types[1].id}
                    className="!text-green-500"
                    onClick={() => setSelectedType(types[1])}
                  >
                    Income
                  </ToggleGroupItem>
                </ToggleGroup>
              ) : selectedType.id === TRANSFER_ID || transaction.transactionTransfer ? (
                <ToggleGroup type="single" variant="outline" className="grid grid-cols-1" value={selectedType.id}>
                  <ToggleGroupItem
                    value={types[2].id}
                    className="!text-blue-400"
                    onClick={() => setSelectedType(types[2])}
                  >
                    Transfer
                  </ToggleGroupItem>
                </ToggleGroup>
              ) : (
                <ToggleGroup type="single" variant="outline" className="grid grid-cols-1" value={selectedType.id}>
                  <ToggleGroupItem
                    value={types[3].id}
                    className="!text-orange-400"
                    onClick={() => setSelectedType(types[3])}
                  >
                    Update
                  </ToggleGroupItem>
                </ToggleGroup>
              )
            ) : (
              <ToggleGroup type="single" variant="outline" className="grid grid-cols-4" value={selectedType.id}>
                <ToggleGroupItem
                  value={types[0].id}
                  className="!text-red-500"
                  onClick={() => setSelectedType(types[0])}
                >
                  Expense
                </ToggleGroupItem>
                <ToggleGroupItem
                  value={types[1].id}
                  className="!text-green-500"
                  onClick={() => setSelectedType(types[1])}
                >
                  Income
                </ToggleGroupItem>
                <ToggleGroupItem
                  value={types[2].id}
                  className="!text-blue-400"
                  onClick={() => setSelectedType(types[2])}
                >
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
            )}
          </div>
          {renderForm()}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default EditTransactionSheet;
