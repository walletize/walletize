'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import Spinner from '@/components/ui/spinner';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { errorMessages } from '@/lib/messages';
import { deleteFinancialAccountCategory, updateFinancialAccountCategory } from '@/services/accounts';
import { AccountCategory } from '@/types/AccountCategory';
import { AccountType } from '@/types/AccountType';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { mutate } from 'swr';
import DeleteAccountCategoryDialog from './delete-account-category-dialog';

interface EditAccountCategorySheetProps {
  types: AccountType[];
  category: AccountCategory;
  setOpenEditSheet: React.Dispatch<React.SetStateAction<boolean>>;
  openEditSheet: boolean;
  categoriesCount: number;
}

function EditAccountCategorySheet({
  types,
  category,
  openEditSheet,
  setOpenEditSheet,
  categoriesCount,
}: EditAccountCategorySheetProps) {
  const [selectedType, setSelectedType] = useState<AccountType>(types[0]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  function handleAccountTypeClick(type: AccountType) {
    setSelectedType(type);
  }

  async function handleDelete() {
    if (category) {
      setDeleteLoading(true);
      const res = await deleteFinancialAccountCategory(category.id);
      if (res.ok) {
        mutate((key) => typeof key === 'string' && key.startsWith('/accounts'));
      } else {
        toast.error(errorMessages.get(res.message) || errorMessages.get('default'));
      }

      setDeleteLoading(false);
      setOpenEditSheet(false);
    }
  }

  async function handleSubmit(formData: FormData) {
    setUpdateLoading(true);
    const res = await updateFinancialAccountCategory(category.id, formData, selectedType.id);
    if (res.ok) {
      mutate((key) => typeof key === 'string' && key.startsWith('/accounts'));
    } else {
      toast.error(errorMessages.get(res.message) || errorMessages.get('default'));
    }

    setUpdateLoading(false);
    setOpenEditSheet(false);
  }

  useEffect(() => {
    if (openEditSheet) {
      setSelectedType(types.find((type) => type.id === category.typeId) || types[0]);
      setDeleteLoading(false);
      setUpdateLoading(false);
    }
  }, [category.typeId, openEditSheet, types]);

  return (
    <SheetContent className="flex flex-col">
      <SheetHeader>
        <SheetTitle>Edit category</SheetTitle>
        <SheetDescription>Modify the details of your category.</SheetDescription>
      </SheetHeader>
      <form
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(new FormData(e.currentTarget));
        }}
      >
        <div className="grid gap-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="name">Type</Label>
            <ToggleGroup type="single" variant="outline" className="grid grid-cols-2" value={selectedType.id}>
              <ToggleGroupItem
                value={types[0].id}
                className="!text-green-500"
                onClick={() => handleAccountTypeClick(types[0])}
              >
                Asset
              </ToggleGroupItem>
              <ToggleGroupItem
                value={types[1].id}
                className="!text-red-500"
                onClick={() => handleAccountTypeClick(types[1])}
              >
                Liability
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="name">Category name</Label>
            <Input type="text" name="name" placeholder={category.name} defaultValue={category.name} required />
          </div>
        </div>
        <SheetFooter>
          {categoriesCount > 1 ? (
            <DeleteAccountCategoryDialog category={category} handleDelete={handleDelete}>
              <Button
                className="min-w-20"
                type="button"
                variant="destructive"
                disabled={deleteLoading || updateLoading}
              >
                {deleteLoading ? <Spinner /> : 'Delete category'}
              </Button>
            </DeleteAccountCategoryDialog>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0}>
                  <Button variant="destructive" disabled>
                    Delete category
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>You need to have at least one category</p>
              </TooltipContent>
            </Tooltip>
          )}
          <Button className="min-w-20" type="submit" disabled={updateLoading || deleteLoading}>
            {updateLoading ? <Spinner /> : 'Update category'}
          </Button>
        </SheetFooter>
      </form>
    </SheetContent>
  );
}

export default EditAccountCategorySheet;
