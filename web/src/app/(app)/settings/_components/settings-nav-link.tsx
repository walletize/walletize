'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

interface SettingsNavLinkProps {
  children: React.ReactNode;
  href: string;
}

function SettingsNavLink({ children, href }: SettingsNavLinkProps) {
  const pathname = usePathname();

  return (
    <Link
      href={href}
      className={
        'flex items-center rounded-lg px-3 py-2 transition-all hover:text-primary' +
        (pathname === href ? ' bg-muted text-primary' : ' text-muted-foreground')
      }
    >
      {children}
    </Link>
  );
}

export default SettingsNavLink;
