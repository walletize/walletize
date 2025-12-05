'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Spinner from '@/components/ui/spinner';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { LIABILITY_ID } from '@/lib/constants';
import { errorMessages } from '@/lib/messages';
import { addFinancialAccountCategory } from '@/services/accounts';
import { AccountType } from '@/types/AccountType';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { mutate } from 'swr';

interface AddAccountDialogProps {
  children: React.ReactNode;
  types: AccountType[];
  addType?: string;
}

function AddAccountCategoryDialog({ children, types, addType }: AddAccountDialogProps) {
  const [selectedType, setSelectedType] = useState<AccountType>(types[0]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (openAddDialog) {
      setLoading(false);
      setSelectedType(types[0]);

      if (addType === LIABILITY_ID) {
        setSelectedType(types[1]);
      } else {
        setSelectedType(types[0]);
      }
    }
  }, [addType, openAddDialog, types]);

  async function handleSubmit(formData: FormData) {
    setLoading(true);

    const res = await addFinancialAccountCategory(formData, selectedType.id);
    if (res.ok) {
      mutate((key) => typeof key === 'string' && key.startsWith('/accounts'));
    } else {
      toast.error(errorMessages.get(res.message) || errorMessages.get('default'));
    }

    setLoading(false);
    setOpenAddDialog(false);
    setSelectedType(types[0]);
  }

  return (
    <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a new category</DialogTitle>
          <DialogDescription>Create a new category for your financial accounts.</DialogDescription>
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
                  value={types[0].id}
                  className="!text-green-500"
                  onClick={() => setSelectedType(types[0])}
                >
                  Asset
                </ToggleGroupItem>
                <ToggleGroupItem
                  value={types[1].id}
                  className="!text-red-500"
                  onClick={() => setSelectedType(types[1])}
                >
                  Liability
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="name">Category name</Label>
              <Input
                type="text"
                name="name"
                placeholder={selectedType.id === LIABILITY_ID ? 'Credit Card' : 'Savings Account'}
                required
              />
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

export default AddAccountCategoryDialog;
