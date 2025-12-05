'use client';

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter, usePathname } from 'next/navigation';

function SettingsMobileNav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Select value={pathname.split('/').pop() ?? ''} onValueChange={(value) => router.push(`/settings/${value}`)}>
      <SelectTrigger className="w-full lg:hidden">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem showDot value="account">
            Account
          </SelectItem>
          <SelectItem showDot value="preferences">
            Preferences
          </SelectItem>
          <SelectItem showDot value="categories">
            Categories
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export default SettingsMobileNav;
