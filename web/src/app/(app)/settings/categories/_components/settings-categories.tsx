'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ASSET_ID, EXPENSE_ID, INCOME_ID, LIABILITY_ID } from '@/lib/constants';
import { Plus } from 'lucide-react';
import AccountCategoryRow from '../_components/account-category-row';
import TransactionCategoryRow from '../_components/transaction-category-row';
import AddTransactionCategoryDialog from './add-transaction-category-dialog';
import AddAccountCategoryDialog from './add-account-category-dialog';
import { useAccountTypes } from '@/hooks/accounts';
import { useTransactionTypes } from '@/hooks/transactions';
import Spinner from '@/components/ui/spinner';

function SettingsCategories() {
  const { accountTypes } = useAccountTypes();
  const { transactionTypes } = useTransactionTypes();

  const isLoading = !accountTypes || !transactionTypes;

  return (
    <>
      {isLoading ? (
        <Spinner />
      ) : (
        <main className="flex flex-1 flex-col">
          <Tabs defaultValue="transaction" className="w-full space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="transaction">Transaction Categories</TabsTrigger>
              <TabsTrigger value="account">
                <span className="hidden md:inline">Financial&nbsp;</span>Account Categories
              </TabsTrigger>
            </TabsList>
            <TabsContent value="transaction" className="mt-0 space-y-6">
              <Card>
                <CardHeader className="flex flex-col gap-2 md:flex-row md:gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <CardTitle>Income Categories</CardTitle>
                    <CardDescription>Add, edit, or remove your income categories.</CardDescription>
                  </div>
                  <AddTransactionCategoryDialog types={transactionTypes} addType={INCOME_ID}>
                    <Button className="gap-1 md:ml-auto">
                      <Plus className="h-5 w-5" />
                      Add income category
                    </Button>
                  </AddTransactionCategoryDialog>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-1">
                    {transactionTypes[1].transactionCategories.map((category) => (
                      <TransactionCategoryRow
                        key={category.id}
                        category={category}
                        types={transactionTypes}
                        categoriesCount={transactionTypes[1].transactionCategories.length}
                      ></TransactionCategoryRow>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-col gap-2 md:flex-row md:gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <CardTitle>Expense Categories</CardTitle>
                    <CardDescription>Add, edit, or remove your expense categories.</CardDescription>
                  </div>
                  <AddTransactionCategoryDialog types={transactionTypes} addType={EXPENSE_ID}>
                    <Button className="gap-1 md:ml-auto">
                      <Plus className="h-5 w-5" />
                      Add expense category
                    </Button>
                  </AddTransactionCategoryDialog>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-1">
                    {transactionTypes[0].transactionCategories.map((category) => (
                      <TransactionCategoryRow
                        key={category.id}
                        category={category}
                        types={transactionTypes}
                        categoriesCount={transactionTypes[0].transactionCategories.length}
                      ></TransactionCategoryRow>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="account" className="mt-0 space-y-6">
              <Card>
                <CardHeader className="flex flex-col gap-2 md:flex-row md:gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <CardTitle>Asset Categories</CardTitle>
                    <CardDescription>Add, edit, or remove your asset categories.</CardDescription>
                  </div>
                  <AddAccountCategoryDialog types={accountTypes} addType={ASSET_ID}>
                    <Button className="gap-1 md:ml-auto">
                      <Plus className="h-5 w-5" />
                      Add asset category
                    </Button>
                  </AddAccountCategoryDialog>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-1">
                    {accountTypes[0].accountCategories.map((category) => (
                      <AccountCategoryRow
                        key={category.id}
                        category={category}
                        types={accountTypes}
                        categoriesCount={accountTypes[0].accountCategories.length}
                      ></AccountCategoryRow>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-col gap-2 md:flex-row md:gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <CardTitle>Liability Categories</CardTitle>
                    <CardDescription>Add, edit, or remove your liability categories.</CardDescription>
                  </div>
                  <AddAccountCategoryDialog types={accountTypes} addType={LIABILITY_ID}>
                    <Button className="gap-1 md:ml-auto">
                      <Plus className="h-5 w-5" />
                      Add liability category
                    </Button>
                  </AddAccountCategoryDialog>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-1">
                    {accountTypes[1].accountCategories.map((category) => (
                      <AccountCategoryRow
                        key={category.id}
                        category={category}
                        types={accountTypes}
                        categoriesCount={accountTypes[1].accountCategories.length}
                      ></AccountCategoryRow>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      )}
    </>
  );
}

export default SettingsCategories;
