'use client';

import { Button } from '@/components/ui/button';
import React from 'react';
import { useRouter } from 'next/navigation';

function AccountNotFoundPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center">
      <h2 className="text-9xl font-bold">404</h2>
      <h1 className="mt-2 text-5xl font-bold">Oops! Page not found.</h1>
      <p className="mt-2 text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Button className="mt-8" size="lg" onClick={() => router.back()}>
        Go back
      </Button>
    </div>
  );
}

export default AccountNotFoundPage;
