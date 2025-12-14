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
  selectable?: boolean;
  selected?: boolean;
  disabled?: boolean;
  onSelectChange?: (checked: boolean) => void;
}

function AccountRow({ account, selectable, selected, onSelectChange, disabled }: AccountRowProps) {
  const mainAmount = account.currentValue;

  const rowContent = (
    <div
      key={account.id}
      className={cn(
        'flex items-center gap-2 rounded-lg px-2 py-1 text-left text-sm font-medium transition-colors hover:cursor-pointer',
        selected ? 'bg-muted' : 'hover:bg-muted',
      )}
    >
      {selectable && (
        <input
          type="checkbox"
          className="h-4 w-4 accent-primary"
          checked={selected}
          disabled={disabled}
          onChange={(event) => onSelectChange?.(event.target.checked)}
          onClick={(event) => event.stopPropagation()}
        />
      )}
      <div className="grid w-full grid-cols-[1fr_auto] items-center gap-2 overflow-hidden rounded-lg px-2 py-2 md:grid-cols-5 md:px-4 md:py-3">
        <div className="flex items-center gap-4 md:col-span-2">
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
          <p className="flex items-center justify-end gap-1 whitespace-nowrap font-bold">
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
    </div>
  );

  return (
    <Link href={'/accounts/' + account.id} onClick={(event) => event.stopPropagation()}>
      {rowContent}
    </Link>
  );
}

export default AccountRow;
