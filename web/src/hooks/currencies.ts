import { fetcher } from '@/lib/utils';
import { Currency } from '@/types/Currency';
import useSWR from 'swr';

export function useCurrencies() {
  const { data: currencies, mutate } = useSWR<Currency[]>(`/currencies`, fetcher, {
    keepPreviousData: true,
    loadingTimeout: 7000,
    onLoadingSlow: () => {
      mutate();
    },
  });

  return {
    currencies,
  };
}
