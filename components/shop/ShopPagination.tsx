"use client";

function visiblePageNumbers(page: number, pageCount: number): number[] {
  const s = new Set<number>();
  for (let i = 1; i <= pageCount; i++) {
    if (i === 1 || i === pageCount || Math.abs(i - page) <= 1) s.add(i);
  }
  return [...s].sort((a, b) => a - b);
}

type Props = {
  page: number;
  pageCount: number;
  totalItems: number;
  onPageChange: (p: number) => void;
};

export default function ShopPagination({ page, pageCount, totalItems, onPageChange }: Props) {
  if (pageCount <= 1) return null;

  const prev = Math.max(1, page - 1);
  const next = Math.min(pageCount, page + 1);
  const nums = visiblePageNumbers(page, pageCount);

  return (
    <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-between sm:gap-6 border-t border-neutral-200/80 pt-10">
      <p className="text-sm text-neutral-500 tabular-nums" aria-live="polite">
        Showing page <span className="font-semibold text-neutral-800">{page}</span> of{" "}
        <span className="font-semibold text-neutral-800">{pageCount}</span>
        <span className="hidden sm:inline"> · {totalItems} products</span>
      </p>
      <nav className="flex items-center gap-2" aria-label="Pagination">
        <button
          type="button"
          onClick={() => onPageChange(prev)}
          disabled={page <= 1}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-neutral-200 bg-white text-sm font-semibold text-neutral-800 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50 disabled:pointer-events-none disabled:opacity-35"
          aria-label="Previous page"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex items-center gap-0.5 px-1">
          {nums.map((p, idx) => {
            const prevNum = nums[idx - 1];
            const showEllipsis = idx > 0 && prevNum !== undefined && p - prevNum > 1;
            return (
              <span key={p} className="flex items-center">
                {showEllipsis ? (
                  <span className="px-1.5 text-neutral-400 select-none" aria-hidden>
                    …
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={() => onPageChange(p)}
                  className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-sm font-semibold transition ${
                    p === page
                      ? "bg-neutral-950 text-white shadow-md"
                      : "border border-transparent text-neutral-700 hover:bg-neutral-100"
                  }`}
                  aria-label={`Page ${p}`}
                  aria-current={p === page ? "page" : undefined}
                >
                  {p}
                </button>
              </span>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(next)}
          disabled={page >= pageCount}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-neutral-200 bg-white text-sm font-semibold text-neutral-800 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50 disabled:pointer-events-none disabled:opacity-35"
          aria-label="Next page"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </nav>
    </div>
  );
}
