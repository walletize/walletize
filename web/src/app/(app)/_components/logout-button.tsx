'use client';

import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { errorMessages } from '@/lib/messages';
import { logOut } from '@/services/auth';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';

function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const res = await logOut();

    if (res.ok) {
      router.replace('/login');
      router.refresh();
    } else {
      toast.error(errorMessages.get(res.message) || errorMessages.get('default'));
    }
  }

  return (
    <DropdownMenuItem
      onClick={handleLogout}
      className="flex cursor-pointer items-center gap-1.5 text-negative focus:text-negative"
    >
      <LogOut className="h-4 w-4" />
      Logout
    </DropdownMenuItem>
  );
}

export default LogoutButton;
