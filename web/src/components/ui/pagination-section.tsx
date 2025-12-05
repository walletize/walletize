'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './pagination';

function PaginationSection({ groupedTransactionsCount }: { groupedTransactionsCount: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1');
  const totalPages = Math.ceil(groupedTransactionsCount / 10);

  const getPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const pageNumbersToShow = () => {
    const pages = [];
    const startPage = Math.max(
      page >= 5 && page <= totalPages - 4 ? page - 2 : page >= totalPages - 4 ? totalPages - 4 : 2,
      2,
    );
    const endPage = page >= 5 && page <= totalPages - 4 ? page + 2 : page >= totalPages - 4 ? totalPages - 1 : 5;

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    groupedTransactionsCount > 0 && (
      <Pagination>
        <PaginationContent>
          {/* Previous Button */}
          {page > 1 && (
            <PaginationItem>
              <PaginationPrevious href={getPageUrl(page - 1)} />
            </PaginationItem>
          )}

          {/* First Page Button */}
          <PaginationItem>
            <PaginationLink href={getPageUrl(1)} isActive={page === 1}>
              1
            </PaginationLink>
          </PaginationItem>
          {page > 4 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          {/* Show 3 page numbers around the current page */}
          {pageNumbersToShow().map((pageNumber) => (
            <PaginationItem key={pageNumber}>
              <PaginationLink href={getPageUrl(pageNumber)} isActive={page === pageNumber}>
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          ))}

          {/* Last Page Button */}
          {page < totalPages - 3 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}
          {totalPages > 1 && (
            <PaginationItem>
              <PaginationLink href={getPageUrl(totalPages)} isActive={page === totalPages}>
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          )}

          {/* Next Button */}
          {page < totalPages && (
            <PaginationItem>
              <PaginationNext href={getPageUrl(page + 1)} />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    )
  );
}

export default PaginationSection;
