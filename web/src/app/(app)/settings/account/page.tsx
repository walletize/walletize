import { validateSession } from '@/services/server/auth';
import DangerZoneCard from './_components/danger-zone-card';
import { Metadata } from 'next';
import ProfileCard from './_components/profile-card';
import UpdatePasswordCard from './_components/update-password-card';

export const metadata: Metadata = {
  title: 'Account - Walletize',
  description: 'Manage your account settings.',
  robots: 'noindex',
};

async function AccountSettingPage() {
  const userSession = await validateSession();

  return (
    <main className="flex flex-1 flex-col gap-6">
      <ProfileCard userSession={userSession} />
      {userSession.hasPassword && <UpdatePasswordCard userSession={userSession} />}
      <DangerZoneCard userSession={userSession} />
    </main>
  );
}

export default AccountSettingPage;
