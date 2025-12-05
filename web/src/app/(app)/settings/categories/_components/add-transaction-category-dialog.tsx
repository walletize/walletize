'use client';

import { Button } from '@/components/ui/button';
import { ColorPicker } from '@/components/ui/color-picker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { IconPicker } from '@/components/ui/icon-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Spinner from '@/components/ui/spinner';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { EXPENSE_ID } from '@/lib/constants';
import { errorMessages } from '@/lib/messages';
import { addTransactionCategory } from '@/services/transactions';
import { TransactionType } from '@/types/TransactionType';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { mutate } from 'swr';

interface AddTransactionDialogProps {
  children: React.ReactNode;
  types: TransactionType[];
  addType?: string;
}

function AddTransactionCategoryDialog({ children, types, addType }: AddTransactionDialogProps) {
  const [selectedType, setSelectedType] = useState<TransactionType>(types[1]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [color, setColor] = useState('#27272a');
  const [icon, setIcon] = useState('circle-dashed.svg');
  const [iconColor, setIconColor] = useState('white');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (openAddDialog) {
      setSelectedType(types[0]);
      setColor('#27272a');
      setIcon('circle-dashed.svg');
      setIconColor('white');
      setLoading(false);

      if (addType === EXPENSE_ID) {
        setSelectedType(types[0]);
      } else {
        setSelectedType(types[1]);
      }
    }
  }, [addType, openAddDialog, types]);

  async function handleSubmit(formData: FormData) {
    setLoading(true);

    const res = await addTransactionCategory(formData, selectedType.id, color, icon, iconColor);
    if (res.ok) {
      mutate((key) => typeof key === 'string' && key.startsWith('/transactions'));
    } else {
      toast.error(errorMessages.get(res.message) || errorMessages.get('default'));
    }

    setOpenAddDialog(false);
    setSelectedType(types[0]);
    setLoading(false);
  }

  return (
    <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a new category</DialogTitle>
          <DialogDescription>Create a new category for your transactions.</DialogDescription>
        </DialogHeader>
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
                <ToggleGroupItem
                  value={types[0].id}
                  className="!text-red-500"
                  onClick={() => setSelectedType(types[0])}
                >
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
                <Input
                  type="text"
                  name="name"
                  placeholder={selectedType.id === EXPENSE_ID ? 'Entertainment' : 'Salary'}
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button className="min-w-20" type="submit" disabled={loading}>
              {loading ? <Spinner /> : 'Add category'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddTransactionCategoryDialog;
