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
import { User } from '@/types/User';
import React from 'react';

interface DeleteAccountInviteDialogProps {
  children: React.ReactNode;
  user: User | undefined;
  onConfirm: () => void;
}

function DeleteAccountInviteDialog({ children, user, onConfirm }: DeleteAccountInviteDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will remove the user&nbsp;
            <span className="font-medium text-accent-foreground">&quot;{user?.name || 'No Name'}&quot;</span> from this
            account. They will not be able to access the account anymore unless they are invited again.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={onConfirm}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteAccountInviteDialog;
