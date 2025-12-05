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
import { TransactionCategory } from '@/types/TransactionCategory';
import React from 'react';

interface DeleteTransactionCategoryDialogProps {
  category: TransactionCategory;
  handleDelete: () => void;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  children?: React.ReactNode;
}

function DeleteTransactionCategoryDialog({
  category,
  handleDelete,
  open,
  setOpen,
  children,
}: DeleteTransactionCategoryDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the category{' '}
            <span className="font-medium text-accent-foreground">&quot;{category.name}&quot;</span> along with all
            transactions associated with it.
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

export default DeleteTransactionCategoryDialog;
