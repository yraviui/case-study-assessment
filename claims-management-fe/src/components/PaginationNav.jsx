
import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function PaginationNav({
  currentPage,
  numOfTotalPages,
  goToPage,
}) {
  const safeCurrentPage = Math.min(
    currentPage,
    Math.max(numOfTotalPages, 1)
  );

  const buttonBase =
    'inline-flex h-8 min-w-8 items-center justify-center rounded-lg border text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40';

  // Dynamic page numbers and ellipses
  const getPageRange = () => {
    const range = [];
    const total = numOfTotalPages;
    const current = safeCurrentPage;

    if (total <= 5) {
      for (let i = 1; i <= total; i++) {
        range.push(i);
      }
    } else if (current <= 3) {
      range.push(1, 2, 3, 4, '...', total);
    } else if (current >= total - 2) {
      range.push(
        1,
        '...',
        total - 3,
        total - 2,
        total - 1,
        total
      );
    } else {
      range.push(
        1,
        '...',
        current - 1,
        current,
        current + 1,
        '...',
        total
      );
    }

    return range;
  };

  const pageRange = getPageRange();

  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-1.5"
      aria-label="Customer pagination"
    >
      {/* Previous Page Button */}
      <button
        type="button"
        onClick={() => goToPage(safeCurrentPage - 1)}
        disabled={
          safeCurrentPage === 1 || numOfTotalPages === 0
        }
        title="Previous page"
        aria-label="Previous page"
        className={`${buttonBase} border-gray-200 text-gray-400 hover:bg-purple-50 hover:text-purple-600 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-400`}
      >
        <FiChevronLeft />
      </button>

      {/* Dynamic Page Numbers & Ellipses */}
      {pageRange.map((page, index) => {
        if (page === '...') {
          return (
            <span
              key={`ellipsis-${index}`}
              className="select-none px-2 text-sm font-medium text-gray-400"
            >
              ...
            </span>
          );
        }

        return (
          <button
            type="button"
            key={page}
            onClick={() => goToPage(Number(page))}
            aria-current={
              safeCurrentPage === page ? 'page' : undefined
            }
            className={`${buttonBase} cursor-pointer rounded-lg border px-3.5 py-1.5 text-sm transition-colors ${
              safeCurrentPage === page
                ? 'border-[#5c3bf5] bg-[#5c3bf5] font-semibold text-white shadow-sm'
                : 'border-transparent bg-gray-50 font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-600'
            }`}
          >
            {page}
          </button>
        );
      })}

      {/* Next Page Button */}
      <button
        type="button"
        onClick={() => goToPage(safeCurrentPage + 1)}
        disabled={
          safeCurrentPage === numOfTotalPages ||
          numOfTotalPages === 0
        }
        title="Next page"
        aria-label="Next page"
        className={`${buttonBase} cursor-pointer border-gray-200 text-gray-400 hover:bg-purple-50 hover:text-purple-600 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-400`}
      >
        <FiChevronRight />
      </button>
    </nav>
  );
}
