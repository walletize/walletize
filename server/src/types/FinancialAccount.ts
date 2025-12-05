import { AccountCategory } from './AccountCategory';
import { Currency } from './Currency';

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
  accountCategory: AccountCategory;
  currency: Currency;
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
  accountCategory: AccountCategory;
  currency: Currency;
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
    initialValue: parseInt(rawFinancialAccount.initialValue),
    currentValue: parseInt(rawFinancialAccount.currentValue),
  };
}
