'use client';

import { Button } from '@/components/ui/button';

export default function Error() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center">
      <h2 className="text-9xl font-bold">500</h2>
      <h1 className="mt-2 text-5xl font-bold">Oops! Something went wrong.</h1>
      <p className="mt-2 text-muted-foreground">An error occurred while processing your request. Please try again.</p>
      <Button className="mt-8" size="lg" onClick={() => window.location.reload()}>
        Try again
      </Button>
    </div>
  );
}
