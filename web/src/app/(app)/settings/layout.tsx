import React from 'react';
import SettingsMobileNav from './_components/settings-mobile-nav';
import SettingsNavLink from './_components/settings-nav-link';

interface AppSettingsLayoutProps {
  children: React.ReactNode;
}

function layout({ children }: AppSettingsLayoutProps) {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6 md:pl-2">
      <div className="flex flex-row items-center space-y-1.5">
        <div className="grid gap-2">
          <h3 className="text-2xl font-semibold leading-none tracking-tight">Settings</h3>
          <p className="text-sm text-muted-foreground">Manage your account and how you use Walletize.</p>
        </div>
      </div>
      <div className="flex h-full flex-col gap-6 lg:flex-row">
        <nav className="hidden flex-col gap-2 text-sm text-muted-foreground lg:flex">
          <SettingsNavLink href="/settings/account">Account</SettingsNavLink>
          <SettingsNavLink href="/settings/preferences">Preferences</SettingsNavLink>
          <SettingsNavLink href="/settings/categories">Categories</SettingsNavLink>
        </nav>
        <SettingsMobileNav />
        {children}
      </div>
    </main>
  );
}

export default layout;
