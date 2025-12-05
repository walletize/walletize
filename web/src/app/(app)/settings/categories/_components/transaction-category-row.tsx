'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetTrigger } from '@/components/ui/sheet';
import Spinner from '@/components/ui/spinner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { errorMessages } from '@/lib/messages';
import { deleteTransactionCategory } from '@/services/transactions';
import { TransactionCategory } from '@/types/TransactionCategory';
import { TransactionType } from '@/types/TransactionType';
import { Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'sonner';
import { mutate } from 'swr';
import DeleteTransactionCategoryDialog from './delete-transaction-category-dialog';
import EditTransactionCategorySheet from './edit-transaction-category-sheet';

interface CategoryRowProps {
  category: TransactionCategory;
  types: TransactionType[];
  categoriesCount: number;
}

function TransactionCategoryRow({ category, types, categoriesCount }: CategoryRowProps) {
  const [openEditSheet, setOpenEditSheet] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);

    const res = await deleteTransactionCategory(category.id);
    if (res.ok) {
      mutate((key) => typeof key === 'string' && key.startsWith('/transactions'));
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
                <AvatarFallback style={{ backgroundColor: category.color }}>
                  <div className="flex h-5 w-5 items-center justify-center">
                    <Image
                      src={'/icons/' + category.icon}
                      width={0}
                      height={0}
                      sizes="100vw"
                      style={{ width: 'auto', height: 'auto' }}
                      alt="Walletize Logo"
                      className={category.iconColor === 'white' ? 'invert' : ''}
                    />
                  </div>
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span>{category.name}</span>
                <span className="inline font-normal text-muted-foreground md:hidden">
                  {category._count?.transactions} {category._count?.transactions === 1 ? 'transaction' : 'transactions'}
                </span>
              </div>
            </div>
            <div className="hidden text-muted-foreground md:block">
              {category._count?.transactions} {category._count?.transactions === 1 ? 'transaction' : 'transactions'}
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
                  {loading ? <Spinner /> : <Trash2 className="h-4 w-4 text-negative"></Trash2>}
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
        <EditTransactionCategorySheet
          category={category}
          types={types}
          openEditSheet={openEditSheet}
          setOpenEditSheet={setOpenEditSheet}
          categoriesCount={categoriesCount}
        ></EditTransactionCategorySheet>
      </Sheet>
      <DeleteTransactionCategoryDialog
        category={category}
        handleDelete={handleDelete}
        open={openDeleteDialog}
        setOpen={setOpenDeleteDialog}
      />
    </>
  );
}

export default TransactionCategoryRow;
