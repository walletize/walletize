'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatCurrency } from '@/lib/utils';
import { FinancialAccount } from '@/types/FinancialAccount';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarAccountRowProps {
  account: FinancialAccount;
  query: { [key: string]: string };
  onClick?: () => void;
}

function SidebarAccountRow({ account, query, onClick }: SidebarAccountRowProps) {
  const pathname = usePathname();

  return (
    <Link
      onClick={onClick}
      href={{
        pathname: '/accounts/' + account.id,
        query,
      }}
      className={
        'flex min-w-0 items-center gap-4 rounded-lg p-3 transition hover:bg-muted' +
        (pathname === '/accounts/' + account.id ? ' bg-muted' : '')
      }
    >
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
      <div className="flex w-full min-w-0 flex-col xl:flex-row xl:justify-between xl:gap-2">
        <div className="grid gap-0.5">
          <p className="truncate text-sm leading-none">{account.name}</p>
          <p className="truncate text-sm text-muted-foreground">{account.accountCategory.name}</p>
        </div>
        <p className="flex items-center gap-1 font-bold xl:justify-end">
          <span className="text-nowrap text-xs text-muted-foreground">
            {account.currentValue < 0 ? '-' : ''}
            {account.currency.symbol}
          </span>
          <span
            className={cn(
              'truncate text-sm',
              account.currentValue > 0 ? 'text-positive' : account.currentValue < 0 ? 'text-negative' : '',
            )}
          >
            {formatCurrency(Math.abs(account.currentValue))}
          </span>
        </p>
      </div>
    </Link>
  );
}

export function SidebarAccountRowLoading() {
  return (
    <div className="flex items-center gap-4 rounded-lg p-3">
      <Skeleton className="h-9 w-9 rounded-full" />
      <div className="flex-center flex w-full justify-between gap-2">
        <div className="hidden gap-0.5 lg:grid">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3.5 w-16" />
        </div>
        <div className="flex items-center justify-end gap-1 font-bold">
          <Skeleton className="h-3.5 w-16" />
        </div>
      </div>
    </div>
  );
}

export default SidebarAccountRow;
