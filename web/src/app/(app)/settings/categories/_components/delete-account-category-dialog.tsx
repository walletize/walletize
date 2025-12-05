import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { AccountCategory } from '@/types/AccountCategory';
import React from 'react';

interface DeleteAccountCategoryDialogProps {
  category: AccountCategory;
  handleDelete: () => void;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  children?: React.ReactNode;
}

function DeleteAccountCategoryDialog({
  category,
  handleDelete,
  open,
  setOpen,
  children,
}: DeleteAccountCategoryDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the category{' '}
            <span className="font-medium text-accent-foreground">&quot;{category.name}&quot;</span> along with all
            accounts associated with it.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={handleDelete}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteAccountCategoryDialog;
