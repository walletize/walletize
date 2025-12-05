import { fetcher } from '@/lib/utils';
import { formatDateToString } from '@/lib/utils';
import { AccountInvite } from '@/types/AccountInvite';
import { AccountType } from '@/types/AccountType';
import {
  RawAccountsRes,
  RawFinancialAccount,
  serializeAccountsRes,
  serializeFinancialAccount,
} from '@/types/FinancialAccount';
import useSWR from 'swr';

export function useAccounts(startDate?: Date) {
  const params = new URLSearchParams();
  if (startDate) {
    params.append('startDate', formatDateToString(startDate));
  }

  const { data: rawAccountsRes, mutate: mutateAccounts } = useSWR<RawAccountsRes>(`/accounts/user?${params}`, fetcher, {
    keepPreviousData: true,
    loadingTimeout: 7000,
    onLoadingSlow: () => {
      mutateAccounts();
    },
  });
  const accountsRes = rawAccountsRes ? serializeAccountsRes(rawAccountsRes) : undefined;

  return {
    accountsRes,
    mutateAccounts,
  };
}

export function useAccount(accountId: string) {
  const { data: rawFinancialAccount, mutate: mutateAccount } = useSWR<RawFinancialAccount>(
    `/accounts/${accountId}`,
    fetcher,
    {
      keepPreviousData: true,
      loadingTimeout: 7000,
      onLoadingSlow: () => {
        mutateAccount();
      },
    },
  );
  const account = rawFinancialAccount ? serializeFinancialAccount(rawFinancialAccount) : undefined;

  return {
    account,
    mutateAccount,
  };
}

export function useAccountTypes() {
  const { data: accountTypes, mutate } = useSWR<AccountType[]>(`/accounts/types`, fetcher, {
    keepPreviousData: true,
    loadingTimeout: 7000,
    onLoadingSlow: () => {
      mutate();
    },
  });

  return {
    accountTypes,
  };
}

export function useAccountInvites() {
  const { data: accountInvites, mutate } = useSWR<AccountInvite[]>(`/accounts/invites`, fetcher, {
    keepPreviousData: true,
    loadingTimeout: 7000,
    onLoadingSlow: () => {
      mutate();
    },
  });

  return {
    accountInvites,
  };
}
