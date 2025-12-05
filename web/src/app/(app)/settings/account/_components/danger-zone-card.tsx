'use client';

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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Spinner from '@/components/ui/spinner';
import { errorMessages } from '@/lib/messages';
import { deleteUser } from '@/services/users';
import { User } from '@/types/User';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface ProfileCardProps {
  userSession: User;
}

function DangerZoneCard({ userSession }: ProfileCardProps) {
  const router = useRouter();

  const [openDialog, setOpenDialog] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (email !== userSession.email) return;

    setLoading(true);

    const res = await deleteUser();
    if (res.ok) {
      router.replace('/login');
    } else {
      toast.error(errorMessages.get(res.message) || errorMessages.get('default'));
      setLoading(false);
    }
  }

  useEffect(() => {
    if (openDialog) setEmail('');
  }, [openDialog]);

  return (
    <div>
      <Card x-chunk="dashboard-04-chunk-1" className="border-destructive">
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
          <CardDescription>Critical actions for your account. Please proceed with caution.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-4">
            <div>
              <p>Delete account</p>
              <p className="text-sm text-muted-foreground">This will delete all your data and this cannot be undone.</p>
            </div>
            <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full md:w-fit">
                  Delete account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account and remove your data from
                    our servers.
                  </AlertDialogDescription>
                  <div className="grid h-fit w-full items-center gap-1.5 pt-2">
                    <Label htmlFor="email" className="text-muted-foreground">
                      Enter your email to proceed
                    </Label>
                    <Input
                      type="text"
                      name="email"
                      placeholder={userSession.email}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={handleDelete}
                    disabled={email !== userSession.email || loading}
                  >
                    {loading ? <Spinner /> : 'Delete account'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default DangerZoneCard;
