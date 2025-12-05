import {
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/ui/spinner';
import { errorMessages } from '@/lib/messages';
import { leaveAccount } from '@/services/accounts';
import { FinancialAccount } from '@/types/FinancialAccount';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { mutate } from 'swr';

function LeaveAccountDialog({ account }: { account: FinancialAccount }) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function handleLeaveAccount() {
    setLoading(true);

    const res = await leaveAccount(account.id);
    if (res.ok) {
      router.replace('/accounts');
      mutate((key) => typeof key === 'string' && key.startsWith('/accounts/user'));
    } else {
      toast.error(errorMessages.get(res.message) || errorMessages.get('default'));
      setLoading(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className="gap-2" variant="destructive">
          <LogOut className="h-5 w-5" />
          <span className="hidden xl:block">Leave account</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            You will leave the account&nbsp;
            <span className="font-medium text-accent-foreground">&quot;{account.name}&quot;</span> and you will no
            longer be able to access this account unless you receive another invitation.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={handleLeaveAccount}
            disabled={loading}
          >
            {loading ? <Spinner /> : 'Leave'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default LeaveAccountDialog;
