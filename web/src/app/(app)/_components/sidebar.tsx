'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useAccounts, useAccountTypes } from '@/hooks/accounts';
import { useCurrencies } from '@/hooks/currencies';
import { useUser } from '@/hooks/user';
import { APP_VERSION, ASSET_ID, LIABILITY_ID } from '@/lib/constants';
import { formatDateParam, isSameDate } from '@/lib/utils';
import { User } from '@/types/User';
import { endOfMonth, startOfMonth } from 'date-fns';
import { Banknote, Bug, Layers, LayoutDashboard, Plus, Settings, User as UserIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useContext } from 'react';
import AddAccountDialog from '../accounts/_components/add-account-dialog';
import { DateRangeContext } from './date-range-context';
import LogoutButton from './logout-button';
import NavLink from './nav-link';
import SidebarAccountRow, { SidebarAccountRowLoading } from './sidebar-account-row';

interface SidebarProps {
  userSession: User;
  className?: string;
  setOpenSheet?: (open: boolean) => void;
}

function Sidebar({ userSession, className, setOpenSheet }: SidebarProps) {
  const { date } = useContext(DateRangeContext);
  const query: { [key: string]: string } = {};
  if (date?.from && date?.to) {
    if (!isSameDate(date.from, startOfMonth(new Date())) || !isSameDate(date.to, endOfMonth(new Date()))) {
      query.period = formatDateParam(date.from, date.to);
    }
  } else {
    query.period = 'all';
  }

  const { user } = useUser(userSession);
  const { accountTypes } = useAccountTypes();
  const { currencies } = useCurrencies();
  const { accountsRes } = useAccounts();
  const assetAccounts =
    accountsRes && accountsRes.accounts.filter((account) => account.accountCategory.accountType.id === ASSET_ID);
  const liabilityAccounts =
    accountsRes && accountsRes.accounts.filter((account) => account.accountCategory.accountType.id === LIABILITY_ID);

  user.mainCurrency = currencies && currencies.find((currency) => currency.id === user.mainCurrencyId);
  const isLoading = !accountTypes || !currencies || !accountsRes || !assetAccounts || !liabilityAccounts;

  return (
    <div className={className ? className : ''}>
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex items-center px-6 pt-8 md:px-6 md:pt-4">
          <Link
            onClick={() => setOpenSheet && setOpenSheet(false)}
            href={{
              pathname: '/dashboard',
              query,
            }}
            className="flex items-center gap-2 font-semibold"
          >
            <div className="h-8 w-8">
              <Image
                src="/walletize.svg"
                width={0}
                height={0}
                sizes="100vw"
                style={{ width: 'auto', height: 'auto' }}
                alt="Walletize Logo"
              />
            </div>
            <span className="hidden font-bold lg:block">Walletize</span>
          </Link>
          <div className="ml-2 rounded-lg border border-muted px-2 py-1 text-xs font-bold text-primary">SH</div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-auto text-muted-foreground">
                <UserIcon className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="font-normal text-muted-foreground">
                {user.name}
                <p className="mt-1 text-xs font-normal text-muted-foreground/80">Web v{APP_VERSION}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link onClick={() => setOpenSheet && setOpenSheet(false)} href="/settings/account">
                <DropdownMenuItem className="flex items-center gap-1.5 hover:cursor-pointer">
                  <Settings className="h-4 w-4" />
                  Settings
                </DropdownMenuItem>
              </Link>
              <Link
                onClick={() => setOpenSheet && setOpenSheet(false)}
                href="https://github.com/Walletize/web/issues"
                target="_blank"
              >
                <DropdownMenuItem className="flex items-center gap-1.5 hover:cursor-pointer">
                  <Bug className="h-4 w-4" />
                  Report bug
                </DropdownMenuItem>
              </Link>{' '}
              <DropdownMenuSeparator />
              <LogoutButton></LogoutButton>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex-1 px-4">
          <nav className="grid items-start text-sm font-medium">
            <NavLink href="/dashboard" query={query} onClick={() => setOpenSheet && setOpenSheet(false)}>
              <LayoutDashboard className="h-4 w-4"></LayoutDashboard>
              Dashboard
            </NavLink>
            <NavLink href="/transactions" query={query} onClick={() => setOpenSheet && setOpenSheet(false)}>
              <Banknote className="h-4 w-4" />
              Transactions
            </NavLink>
            <NavLink href="/accounts" onClick={() => setOpenSheet && setOpenSheet(false)}>
              <Layers className="h-4 w-4" />
              Accounts
            </NavLink>
          </nav>
          <Separator className="my-4" />
          <div>
            <div className="flex items-center justify-between">
              <h4 className="px-3 text-sm font-semibold text-muted-foreground">Assets</h4>
              {isLoading ? (
                <Skeleton className="h-6 w-6" />
              ) : (
                <AddAccountDialog types={accountTypes} addType={ASSET_ID} currencies={currencies} user={user}>
                  <Button variant="ghost" className="h-6 w-6 p-0 text-muted-foreground hover:text-accent-foreground">
                    <Plus className="h-4 w-4"></Plus>
                  </Button>
                </AddAccountDialog>
              )}
            </div>
            <div className="mt-2 grid">
              {isLoading ? (
                <>
                  <SidebarAccountRowLoading />
                  <SidebarAccountRowLoading />
                  <SidebarAccountRowLoading />
                </>
              ) : assetAccounts.length === 0 ? (
                <p className="w-full rounded-lg border border-dashed px-1 py-4 text-center text-sm text-muted-foreground">
                  No asset accounts available.
                </p>
              ) : (
                assetAccounts.map((account) => (
                  <SidebarAccountRow
                    key={account.id}
                    account={account}
                    query={query}
                    onClick={() => setOpenSheet && setOpenSheet(false)}
                  />
                ))
              )}
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <h4 className="px-3 text-sm font-semibold text-muted-foreground">Liabilities</h4>
              {isLoading ? (
                <Skeleton className="h-6 w-6" />
              ) : (
                <AddAccountDialog types={accountTypes} addType={LIABILITY_ID} currencies={currencies} user={user}>
                  <Button variant="ghost" className="h-6 w-6 p-0 text-muted-foreground hover:text-accent-foreground">
                    <Plus className="h-4 w-4"></Plus>
                  </Button>
                </AddAccountDialog>
              )}
            </div>
            <div className="mt-2 grid">
              {isLoading ? (
                <>
                  <SidebarAccountRowLoading />
                  <SidebarAccountRowLoading />
                  <SidebarAccountRowLoading />
                </>
              ) : liabilityAccounts.length === 0 ? (
                <p className="w-full rounded-lg border border-dashed px-1 py-4 text-center text-sm text-muted-foreground">
                  No liability accounts available.
                </p>
              ) : (
                liabilityAccounts.map((account) => (
                  <SidebarAccountRow
                    key={account.id}
                    account={account}
                    query={query}
                    onClick={() => setOpenSheet && setOpenSheet(false)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
