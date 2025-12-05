'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn, getInitials } from '@/lib/utils';
import { acceptAccountInvite, declineAccountInvite } from '@/services/accounts';
import { AccountInvite, InviteStatus } from '@/types/AccountInvite';
import { DialogTrigger } from '@radix-ui/react-dialog';
import { Check, X } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { mutate } from 'swr';

interface AccountInvitesDialogProps {
  children: React.ReactNode;
  accountInvites: AccountInvite[];
}

function AccountInvitesDialog({ children, accountInvites }: AccountInvitesDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Incoming invites</DialogTitle>
          <DialogDescription>Check your incoming account invites here.</DialogDescription>
        </DialogHeader>
        {accountInvites.length === 0 ? (
          <p className="w-full rounded-lg border border-dashed py-4 text-center text-sm text-muted-foreground">
            No incoming invites
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {accountInvites.map((accountInvite) => (
              <div key={accountInvite.email} className="flex flex-col gap-2 border-b pb-4 last:border-none last:pb-0">
                <div className="col-span-2 flex items-center gap-3">
                  <Avatar className="flex h-7 w-7 items-center justify-center">
                    <AvatarFallback
                      className={cn(
                        'text-xs font-normal',
                        accountInvite.status === InviteStatus.PENDING ? 'bg-muted/50 text-foreground/50' : '',
                      )}
                    >
                      {getInitials(accountInvite.email)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-xs">
                    {accountInvite.email} <span className="text-xs text-muted-foreground">invites you to join</span>
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="flex h-9 w-9 items-center justify-center">
                      <AvatarFallback style={{ backgroundColor: accountInvite.financialAccount?.color }}>
                        <div className="flex h-5 w-5 items-center justify-center">
                          <Image
                            src={'/icons/' + accountInvite.financialAccount?.icon}
                            width={0}
                            height={0}
                            sizes="100vw"
                            style={{ width: 'auto', height: 'auto' }}
                            alt="Walletize Logo"
                            className={accountInvite.financialAccount?.iconColor === 'white' ? 'invert' : ''}
                          />
                        </div>
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-semibold">
                      {accountInvite.financialAccount?.name}&nbsp;
                      <span className="text-muted-foreground">
                        {' '}
                        <span className="px-1 font-thin">|</span> {accountInvite.financialAccount?.accountCategory.name}{' '}
                        <span className="px-1 font-thin">|</span> {accountInvite.financialAccount?.currency.code}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      className="h-8 w-8"
                      onClick={async () => {
                        const res = await acceptAccountInvite(accountInvite.id || '');
                        if (res.ok) {
                          toast.success('You have successfully joined the account');
                          mutate(
                            (key) =>
                              typeof key === 'string' &&
                              (key.startsWith('/accounts') || key.startsWith('/transactions')),
                          );
                        } else {
                          toast.error('Oops! Something went wrong, please try again');
                        }
                      }}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-8 w-8"
                      onClick={async () => {
                        const res = await declineAccountInvite(accountInvite.id || '');
                        if (res.ok) {
                          toast.success('The invite has been declined');
                          mutate((key) => typeof key === 'string' && key.startsWith('/accounts/invites'));
                        } else {
                          toast.error('Oops! Something went wrong, please try again');
                        }
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default AccountInvitesDialog;
