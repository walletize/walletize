'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Spinner from '@/components/ui/spinner';
import { useUser } from '@/hooks/user';
import { errorMessages } from '@/lib/messages';
import { updatePasswordSchema } from '@/lib/schema';
import { updatePassword } from '@/services/users';
import { User } from '@/types/User';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

interface UpdatePasswordCardProps {
  userSession: User;
}

function UpdatePasswordCard({ userSession }: UpdatePasswordCardProps) {
  const { user } = useUser(userSession);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof updatePasswordSchema>>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const formValues = form.watch();
  const isFormEmpty = !formValues.currentPassword && !formValues.newPassword && !formValues.confirmPassword;

  async function handleSubmit(values: z.infer<typeof updatePasswordSchema>) {
    if (!user) return;

    setLoading(true);

    const res = await updatePassword(values.currentPassword, values.newPassword);
    if (res.ok) {
      form.reset();
      toast.success('Update successful! Your password has been updated.');
    } else {
      toast.error(errorMessages.get(res.message) || errorMessages.get('default'));
    }

    setLoading(false);
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>Change your password to keep your account secure.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <CardContent>
              <div className="grid w-full gap-4">
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter your current password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid w-full grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter your new password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Confirm your new password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t !py-4 px-6">
              <Button className="min-w-20" type="submit" disabled={loading || isFormEmpty}>
                {loading ? <Spinner /> : 'Update Password'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}

export default UpdatePasswordCard;
