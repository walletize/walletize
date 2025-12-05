import { validateSession } from '@/services/server/auth';
import SettingsPreferences from './_components/settings-preferences';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Preferences - Walletize',
  description: 'Manage your preferences for Walletize.',
  robots: 'noindex',
};

async function PreferencesSettingPage() {
  const session = await validateSession();

  return <SettingsPreferences session={session} />;
}

export default PreferencesSettingPage;
