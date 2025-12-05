'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

interface NavLinkProps {
  href: string;
  query?: { [key: string]: string };
  children: React.ReactNode;
  onClick?: () => void;
}

function NavLink({ href, query, children, onClick }: NavLinkProps) {
  const pathname = usePathname();

  return (
    <Link
      href={{
        pathname: href,
        query,
      }}
      className={
        'flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary' +
        (pathname === href ? ' bg-muted text-primary' : ' text-muted-foreground')
      }
      onClick={onClick}
    >
      {children}
    </Link>
  );
}

export default NavLink;
