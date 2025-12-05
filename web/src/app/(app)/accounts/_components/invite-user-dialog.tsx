'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Spinner from '@/components/ui/spinner';
import { generateInviteUserSchema } from '@/lib/schema';
import { sendAccountInvite } from '@/services/accounts';
import { AccountInvite } from '@/types/AccountInvite';
import { User } from '@/types/User';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { mutate } from 'swr';
import { z } from 'zod';

function InviteUserDialog({
  children,
  setAccountInvites,
  user,
  accountId,
}: {
  children: React.ReactNode;
  setAccountInvites: Dispatch<SetStateAction<AccountInvite[]>>;
  user: User;
  accountId?: string;
}) {
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const inviteUserSchema = generateInviteUserSchema(user.email || '');
  const form = useForm<z.infer<typeof inviteUserSchema>>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      email: '',
    },
  });

  async function handleSubmit(values: z.infer<typeof inviteUserSchema>) {
    setLoading(true);

    if (accountId) {
      const res = await sendAccountInvite(values.email, accountId);
      if (res.ok) {
        toast.success('The invite has been sent successfully');
        mutate((key) => typeof key === 'string' && key.startsWith('/account'));
      } else {
        toast.error('Oops! Something went wrong, please try again');
      }
    } else {
      setAccountInvites((prev) => {
        if (prev.find((predicate) => predicate.email === values.email)) {
          return prev;
        } else {
          return [...prev, { email: values.email }];
        }
      });
    }

    setOpenDialog(false);
    setLoading(false);
  }

  useEffect(() => {
    if (openDialog) {
      form.reset();
    }
  }, [form, openDialog]);

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite a user</DialogTitle>
          <DialogDescription>Send an invite to a user to give them access to this account</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit(handleSubmit)(e);
            }}
            className="grid gap-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="john.doe@example.com" {...field} type="text" autoComplete="off" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="ml-auto w-fit" disabled={loading}>
              {loading ? <Spinner /> : 'Submit'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default InviteUserDialog;
