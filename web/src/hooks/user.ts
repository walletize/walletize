import { fetcher } from '@/lib/utils';
import { User } from '@/types/User';
import useSWR from 'swr';

export function useUser(userData: User, refreshInterval?: number) {
  const { data: user, mutate } = useSWR<User>(`/auth/session/validate`, fetcher, {
    keepPreviousData: true,
    fallbackData: userData,
    loadingTimeout: 7000,
    onLoadingSlow: () => {
      mutate();
    },
    refreshInterval,
  });

  return {
    user: user || userData,
  };
}
