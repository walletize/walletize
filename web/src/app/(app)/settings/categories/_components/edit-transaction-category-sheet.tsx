'use client';

import { Button } from '@/components/ui/button';
import { ColorPicker } from '@/components/ui/color-picker';
import { IconPicker } from '@/components/ui/icon-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import Spinner from '@/components/ui/spinner';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { errorMessages } from '@/lib/messages';
import { deleteTransactionCategory, updateTransactionCategory } from '@/services/transactions';
import { TransactionCategory } from '@/types/TransactionCategory';
import { TransactionType } from '@/types/TransactionType';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { mutate } from 'swr';
import DeleteTransactionCategoryDialog from './delete-transaction-category-dialog';

interface EditTransactionCategorySheetProps {
  types: TransactionType[];
  category: TransactionCategory;
  setOpenEditSheet: React.Dispatch<React.SetStateAction<boolean>>;
  openEditSheet: boolean;
  categoriesCount: number;
}

function EditTransactionCategorySheet({
  types,
  category,
  openEditSheet,
  setOpenEditSheet,
  categoriesCount,
}: EditTransactionCategorySheetProps) {
  const [selectedType, setSelectedType] = useState<TransactionType>(types[0]);
  const [color, setColor] = useState(category.color);
  const [icon, setIcon] = useState(category.icon);
  const [iconColor, setIconColor] = useState(category.iconColor);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  async function handleDelete() {
    if (category) {
      setDeleteLoading(true);

      const res = await deleteTransactionCategory(category.id);
      if (res.ok) {
        mutate((key) => typeof key === 'string' && key.startsWith('/transactions'));
      } else {
        toast.error(errorMessages.get(res.message) || errorMessages.get('default'));
      }

      setDeleteLoading(false);
      setOpenEditSheet(false);
    }
  }

  async function handleSubmit(formData: FormData) {
    setUpdateLoading(true);

    const res = await updateTransactionCategory(category.id, formData, selectedType.id, color, icon, iconColor);
    if (res.ok) {
      mutate((key) => typeof key === 'string' && key.startsWith('/transactions'));
    } else {
      toast.error(errorMessages.get(res.message) || errorMessages.get('default'));
    }

    setUpdateLoading(false);
    setOpenEditSheet(false);
  }

  useEffect(() => {
    if (openEditSheet) {
      setSelectedType(types.find((type) => type.id === category.typeId) || types[0]);
      setColor(category.color);
      setIcon(category.icon);
      setIconColor(category.iconColor);
      setDeleteLoading(false);
      setUpdateLoading(false);
    }
  }, [category.color, category.icon, category.iconColor, category.typeId, openEditSheet, types]);

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
                value={types[1].id}
                className="!text-green-500"
                onClick={() => setSelectedType(types[1])}
              >
                {types[1].name}
              </ToggleGroupItem>
              <ToggleGroupItem value={types[0].id} className="!text-red-500" onClick={() => setSelectedType(types[0])}>
                {types[0].name}
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div className="flex gap-3">
            <div className="grid items-center gap-1.5">
              <Label htmlFor="name">Icon</Label>
              <IconPicker icon={icon} setIcon={setIcon} color={color} iconColor={iconColor} />
            </div>
            <div className="grid items-center gap-1.5">
              <Label htmlFor="name">Color</Label>
              <ColorPicker
                onChange={(v) => {
                  setColor(v);
                }}
                value={color}
                iconColor={iconColor}
                setIconColor={setIconColor}
              />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="name">Category name</Label>
              <Input type="text" name="name" placeholder={category.name} defaultValue={category.name} required />
            </div>
          </div>
        </div>
        <SheetFooter>
          {categoriesCount > 1 ? (
            <DeleteTransactionCategoryDialog category={category} handleDelete={handleDelete}>
              <Button
                className="min-w-20"
                type="button"
                variant="destructive"
                disabled={deleteLoading || updateLoading}
              >
                {deleteLoading ? <Spinner /> : 'Delete category'}
              </Button>
            </DeleteTransactionCategoryDialog>
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
          <Button className="min-w-20" type="submit" disabled={deleteLoading || updateLoading}>
            {updateLoading ? <Spinner /> : 'Update category'}
          </Button>
        </SheetFooter>
      </form>
    </SheetContent>
  );
}

export default EditTransactionCategorySheet;
