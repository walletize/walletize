import { AccountCategory } from './AccountCategory';
import { AccountInvite } from './AccountInvite';
import { Currency } from './Currency';
import { User } from './User';

export interface FinancialAccount {
  id: string;
  name: string;
  userId: string;
  categoryId: string;
  currencyId: string;
  initialValue: number;
  currentValue: number;
  icon: string;
  color: string;
  iconColor: string;
  createdAt: Date;
  updatedAt: Date;
  transactionsCount?: number;
  accountCategory: AccountCategory;
  currency: Currency;
  user: User;
  accountInvites: AccountInvite[];
}

export interface RawFinancialAccount {
  id: string;
  name: string;
  userId: string;
  categoryId: string;
  currencyId: string;
  initialValue: string;
  currentValue: string;
  icon: string;
  color: string;
  iconColor: string;
  createdAt: string;
  updatedAt: string;
  transactionsCount?: number;
  accountCategory: AccountCategory;
  currency: Currency;
  user: User;
  accountInvites: AccountInvite[];
}

export interface RawAccountsRes {
  assetsInitialValues: number;
  liabilitiesInitialValues: number;
  accounts: RawFinancialAccount[];
  prevAssetsValue: number;
  prevLiabilitiesValue: number;
}

export interface AccountsRes {
  assetsInitialValues: number;
  liabilitiesInitialValues: number;
  accounts: FinancialAccount[];
  prevAssetsValue: number;
  prevLiabilitiesValue: number;
}

export function serializeAccountsRes(rawAccountsRes: RawAccountsRes): AccountsRes {
  const results: AccountsRes = {
    ...rawAccountsRes,
    accounts: rawAccountsRes.accounts.map((account) => serializeFinancialAccount(account)),
  };

  return results;
}

export function serializeFinancialAccount(rawFinancialAccount: RawFinancialAccount): FinancialAccount {
  return {
    ...rawFinancialAccount,
    initialValue: Number(rawFinancialAccount.initialValue),
    currentValue: Number(rawFinancialAccount.currentValue),
    createdAt: new Date(rawFinancialAccount.createdAt),
    updatedAt: new Date(rawFinancialAccount.updatedAt),
  };
}
