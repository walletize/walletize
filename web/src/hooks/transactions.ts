import { fetcher } from '@/lib/utils';
import { formatDateToString } from '@/lib/utils';
import { convertRawTransactionsRes, RawTransactionsRes, TransactionChartData } from '@/types/Transaction';
import { TransactionCategory } from '@/types/TransactionCategory';
import { TransactionType } from '@/types/TransactionType';
import useSWR from 'swr';

export function useTransactionsByUserId(
  userId: string,
  startDate?: Date,
  endDate?: Date,
  page?: string | undefined,
  search?: string,
) {
  const params = new URLSearchParams();
  if (startDate) {
    params.append('startDate', formatDateToString(startDate));
  }
  if (endDate) {
    params.append('endDate', formatDateToString(endDate));
  }
  if (page) {
    params.append('page', page);
  }
  if (search) {
    params.append('search', search);
  }

  const { data: rawTransactionsRes, mutate } = useSWR<RawTransactionsRes>(
    `/transactions/user/${userId}?${params}`,
    fetcher,
    {
      keepPreviousData: true,
      loadingTimeout: 7000,
      onLoadingSlow: () => {
        mutate();
      },
    },
  );
  const transactionsRes = rawTransactionsRes ? convertRawTransactionsRes(rawTransactionsRes) : undefined;

  return {
    transactionsRes,
  };
}

export function useTransactionsByAccountId(
  accountId: string,
  startDate?: Date,
  endDate?: Date,
  page?: string | undefined,
) {
  const params = new URLSearchParams();
  if (startDate) {
    params.append('startDate', formatDateToString(startDate));
  }
  if (endDate) {
    params.append('endDate', formatDateToString(endDate));
  }
  if (page) {
    params.append('page', page);
  }

  const { data: rawTransactionsRes, mutate } = useSWR<RawTransactionsRes>(
    `/transactions/account/${accountId}?${params}`,
    fetcher,
    {
      keepPreviousData: true,
      loadingTimeout: 7000,
      onLoadingSlow: () => {
        mutate();
      },
    },
  );
  const transactionsRes = rawTransactionsRes ? convertRawTransactionsRes(rawTransactionsRes) : undefined;

  return {
    transactionsRes,
  };
}

export function useTransactionTypes() {
  const { data: transactionTypes, mutate } = useSWR<TransactionType[]>('/transactions/types', fetcher, {
    keepPreviousData: true,
    loadingTimeout: 7000,
    onLoadingSlow: () => {
      mutate();
    },
  });

  return {
    transactionTypes,
  };
}

export function useTransactionCategories(userId: string | undefined, typeId: string, blocked?: boolean) {
  const {
    isLoading: isTransactionCategoriesLoading,
    data: transactionCategories,
    mutate,
  } = useSWR<TransactionCategory[]>(
    !blocked && userId ? `/transactions/categories/${userId}/types/${typeId}` : null,
    fetcher,
    {
      keepPreviousData: true,
      loadingTimeout: 7000,
      onLoadingSlow: () => {
        mutate();
      },
    },
  );

  return {
    isTransactionCategoriesLoading,
    transactionCategories,
  };
}

export function useTransactionChartData(startDate?: Date, endDate?: Date) {
  const params = new URLSearchParams();
  if (startDate) {
    params.append('startDate', formatDateToString(startDate));
  }
  if (endDate) {
    params.append('endDate', formatDateToString(endDate));
  }

  const { data: transactionChartData, mutate } = useSWR<TransactionChartData>(
    `/transactions/chart?${params}`,
    fetcher,
    {
      keepPreviousData: true,
      loadingTimeout: 7000,
      onLoadingSlow: () => {
        mutate();
      },
    },
  );

  return {
    transactionChartData,
  };
}
