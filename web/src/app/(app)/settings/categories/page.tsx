import { Metadata } from 'next';
import SettingsCategories from './_components/settings-categories';

export const metadata: Metadata = {
  title: 'Categories - Walletize',
  description: 'Manage your transaction and account categories.',
  robots: 'noindex',
};

async function AccountCategorySettingPage() {
  return <SettingsCategories />;
}

export default AccountCategorySettingPage;
