'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Spinner from '@/components/ui/spinner';
import { useUser } from '@/hooks/user';
import { getInitials } from '@/lib/utils';
import { updateUser } from '@/services/users';
import { User } from '@/types/User';
import { useState } from 'react';
import { toast } from 'sonner';
import { mutate } from 'swr';

interface ProfileCardProps {
  userSession: User;
}

function ProfileCard({ userSession }: ProfileCardProps) {
  const { user } = useUser(userSession);

  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);

  async function handleSave(formData: FormData) {
    if (!user) return;

    setLoading(true);

    const res = await updateUser(formData.get('name') as string);
    if (res.ok) {
      toast.success('Update successful! Your changes have been saved.');
      mutate((key) => typeof key === 'string' && key.startsWith('/auth/session/validate'));
    } else {
      toast.error('Oops! Something went wrong, please try again.');
    }

    setLoading(false);
  }

  return (
    <div>
      <Card x-chunk="dashboard-04-chunk-1">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Customize how you appear on Walletize.</CardDescription>
        </CardHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave(new FormData(e.currentTarget));
          }}
        >
          <CardContent>
            <div className="flex gap-8">
              <Avatar className="hidden h-20 w-20 items-start sm:flex">
                <AvatarFallback className="text-xl">{getInitials(user?.name || '')}</AvatarFallback>
              </Avatar>
              <div className="grid w-full gap-4">
                <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="grid h-fit w-full items-center gap-1.5">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      type="text"
                      name="name"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid h-fit w-full items-center gap-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input type="text" name="email" placeholder="johndoe@gmail.com" value={user?.email} disabled />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t !py-4 px-6">
            <Button className="min-w-20" disabled={name === user?.name || name === '' || loading} type="submit">
              {loading ? <Spinner /> : 'Save'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default ProfileCard;
