import { TooltipProvider } from '@/components/ui/tooltip';
import { validateSession } from '@/services/server/auth';
import { redirect } from 'next/navigation';
import React from 'react';
import DateRangeProvider from './_components/date-range-context';
import SheetSidebar from './_components/sheet-sidebar';
import Sidebar from './_components/sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

async function AppLayout({ children }: AppLayoutProps) {
  const userSession = await validateSession();
  if (!userSession) {
    redirect('/login');
  }

  return (
    <DateRangeProvider>
      <TooltipProvider delayDuration={0}>
        <div className="grid min-h-screen w-full md:grid-cols-[200px_1fr] lg:grid-cols-[260px_1fr] xl:grid-cols-[320px_1fr]">
          <Sidebar className="hidden md:block" userSession={userSession} />
          <div className="flex flex-col">
            <header className="flex items-center p-4 pb-0 md:hidden">
              <SheetSidebar userSession={userSession} />
            </header>
            {children}
          </div>
        </div>
      </TooltipProvider>
    </DateRangeProvider>
  );
}

export default AppLayout;
