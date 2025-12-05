'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { errorMessages } from '@/lib/messages';
import { getInitials } from '@/lib/utils';
import { deleteFinancialAccountCategory } from '@/services/accounts';
import { AccountCategory } from '@/types/AccountCategory';
import { AccountType } from '@/types/AccountType';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { mutate } from 'swr';
import DeleteAccountCategoryDialog from './delete-account-category-dialog';
import EditAccountCategorySheet from './edit-account-category-sheet';
import Spinner from '@/components/ui/spinner';

interface CategoryRowProps {
  category: AccountCategory;
  types: AccountType[];
  categoriesCount: number;
}

function AccountCategoryRow({ category, types, categoriesCount }: CategoryRowProps) {
  const [openEditSheet, setOpenEditSheet] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);

    const res = await deleteFinancialAccountCategory(category.id);
    if (res.ok) {
      mutate((key) => typeof key === 'string' && key.startsWith('/accounts'));
    } else {
      toast.error(errorMessages.get(res.message) || errorMessages.get('default'));
    }

    setLoading(false);
  }

  return (
    <>
      <Sheet open={openEditSheet} onOpenChange={setOpenEditSheet}>
        <SheetTrigger asChild>
          <div className="grid grid-cols-3 items-center overflow-hidden rounded-lg p-3 text-left text-sm font-medium transition-colors hover:cursor-pointer hover:bg-muted md:grid-cols-4">
            <div className="col-span-2 flex items-center gap-4">
              <Avatar className="flex h-9 w-9 items-center justify-center">
                <AvatarFallback>{getInitials(category.name)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span>{category.name}</span>
                <span className="inline font-normal text-muted-foreground md:hidden">
                  {category._count?.financialAccounts}{' '}
                  {category._count?.financialAccounts === 1 ? 'account' : 'accounts'}
                </span>
              </div>
            </div>
            <div className="hidden text-muted-foreground md:block">
              {category._count?.financialAccounts} {category._count?.financialAccounts === 1 ? 'account' : 'accounts'}
            </div>
            <div className="flex justify-end">
              {categoriesCount > 1 ? (
                <Button
                  variant="outline"
                  size="icon"
                  className="hover:bg-gray-200 dark:hover:bg-gray-700"
                  disabled={loading}
                  onClick={(e) => {
                    e.preventDefault();
                    setOpenDeleteDialog(true);
                  }}
                >
                  {loading ? <Spinner /> : <Trash2 className="h-4 w-4 text-negative" />}
                </Button>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span tabIndex={0}>
                      <Button
                        variant="outline"
                        size="icon"
                        className="hover:bg-gray-200 dark:hover:bg-gray-700"
                        disabled
                      >
                        <Trash2 className="h-4 w-4 text-negative"></Trash2>
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>You need to have at least one category</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </SheetTrigger>
        <EditAccountCategorySheet
          category={category}
          types={types}
          openEditSheet={openEditSheet}
          setOpenEditSheet={setOpenEditSheet}
          categoriesCount={categoriesCount}
        ></EditAccountCategorySheet>
      </Sheet>
      <DeleteAccountCategoryDialog
        category={category}
        handleDelete={handleDelete}
        open={openDeleteDialog}
        setOpen={setOpenDeleteDialog}
      />
    </>
  );
}

export default AccountCategoryRow;
