'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { User } from '@/types/User';
import { Menu } from 'lucide-react';
import Sidebar from './sidebar';
import { useState } from 'react';

interface SheetSidebarProps {
  userSession: User;
}

function SheetSidebar({ userSession }: SheetSidebarProps) {
  const [openSheet, setOpenSheet] = useState(false);

  return (
    <Sheet open={openSheet} onOpenChange={setOpenSheet}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0 md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col p-0">
        <Sidebar userSession={userSession} setOpenSheet={setOpenSheet} />
      </SheetContent>
    </Sheet>
  );
}

export default SheetSidebar;
