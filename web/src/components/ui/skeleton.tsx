import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('shrink-0 animate-pulse rounded-md bg-muted', className)} {...props} />;
}

export { Skeleton };
