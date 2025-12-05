import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn, formatCurrency, getInitials } from '@/lib/utils';
import { FinancialAccount } from '@/types/FinancialAccount';
import Link from 'next/link';
import React from 'react';
import Image from 'next/image';
import { InviteStatus } from '@/types/AccountInvite';
import { Tooltip as TooltipComponent, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface AccountRowProps {
  account: FinancialAccount;
}

function AccountRow({ account }: AccountRowProps) {
  const mainAmount = account.currentValue;

  return (
    <Link href={'/accounts/' + account.id}>
      <div
        key={account.id}
        className="grid grid-cols-3 items-center gap-2 overflow-hidden rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors hover:cursor-pointer hover:bg-muted md:grid-cols-5"
      >
        <div className="col-span-2 flex items-center gap-4">
          <Avatar className="flex h-9 w-9 items-center justify-center">
            <AvatarFallback style={{ backgroundColor: account.color }}>
              <div className="flex h-5 w-5 items-center justify-center">
                <Image
                  src={'/icons/' + account.icon}
                  width={0}
                  height={0}
                  sizes="100vw"
                  style={{ width: 'auto', height: 'auto' }}
                  alt="Walletize Logo"
                  className={account.iconColor === 'white' ? 'invert' : ''}
                />
              </div>
            </AvatarFallback>
          </Avatar>
          {account.name}
        </div>
        <div className="hidden md:grid">
          <Badge variant="secondary">{account.accountCategory.name}</Badge>
        </div>
        <div className="flex-center hidden w-fit grid-cols-3 gap-1 md:grid lg:grid-cols-4 xl:grid-cols-5">
          <TooltipComponent>
            <TooltipTrigger asChild>
              <Avatar className="flex h-7 w-7 items-center justify-center">
                <AvatarFallback className="text-xs font-normal">
                  {getInitials(account.user.name || account.user.email || '')}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">
                {account.user.name || account.user.email} <span className="text-xs text-muted-foreground">(owner)</span>
              </p>
            </TooltipContent>
          </TooltipComponent>
          {account.accountInvites.map((accountInvite) => (
            <TooltipComponent key={accountInvite.id}>
              <TooltipTrigger asChild>
                <Avatar className="flex h-7 w-7 items-center justify-center">
                  <AvatarFallback
                    className={cn(
                      'text-xs font-normal',
                      accountInvite.status === InviteStatus.PENDING ? 'bg-muted/50 text-foreground/50' : '',
                    )}
                  >
                    {accountInvite.status === InviteStatus.ACCEPTED && accountInvite.user
                      ? getInitials(accountInvite.user.name || accountInvite.email)
                      : getInitials(accountInvite.email)}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  {accountInvite.status === InviteStatus.ACCEPTED && accountInvite.user
                    ? accountInvite.user.name || accountInvite.email
                    : accountInvite.email}{' '}
                  {accountInvite.status === InviteStatus.PENDING && (
                    <span className="text-xs text-muted-foreground">(pending)</span>
                  )}
                </p>
              </TooltipContent>
            </TooltipComponent>
          ))}
        </div>
        <div className="text-right">
          <p className="flex items-center justify-end gap-1 font-bold">
            <span className="text-xs text-muted-foreground">
              {mainAmount < 0 ? '-' : ''}
              {account.currency.symbol}
            </span>
            <span className={mainAmount > 0 ? 'text-positive' : mainAmount < 0 ? 'text-negative' : ''}>
              {formatCurrency(Math.abs(mainAmount))}
            </span>
          </p>
        </div>
      </div>
    </Link>
  );
}

export default AccountRow;
