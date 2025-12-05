'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Spinner from '@/components/ui/spinner';
import { useCurrencies } from '@/hooks/currencies';
import { useUser } from '@/hooks/user';
import { User } from '@/types/User';
import { ThemeToggle } from '../_components/theme-toggle';
import MainCurrencyCombobox from './main-currency-combobox';

function SettingsPreferences({ session }: { session: User }) {
  const { currencies } = useCurrencies();
  const { user } = useUser(session);

  const isLoading = !currencies || !user;

  return isLoading ? (
    <Spinner />
  ) : (
    <main className="flex flex-1 flex-col gap-6">
      <Card x-chunk="dashboard-04-chunk-1">
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>Change how Walletize looks.</CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeToggle />
        </CardContent>
      </Card>
      <MainCurrencyCombobox currencies={currencies} mainCurrencyId={user.mainCurrencyId}></MainCurrencyCombobox>
    </main>
  );
}

export default SettingsPreferences;
