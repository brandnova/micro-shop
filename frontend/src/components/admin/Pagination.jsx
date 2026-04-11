import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, totalPages, hasPrev, hasNext, goTo, prev, next, rangeStart, rangeEnd, total, className = '' }) {
  if (totalPages <= 1) return null

  // Build page number buttons — show at most 5, with ellipsis
  const pages = []
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    // Always show first, last, current, and neighbours
    const set = new Set([1, totalPages, page, page - 1, page + 1].filter(n => n >= 1 && n <= totalPages))
    const sorted = [...set].sort((a, b) => a - b)

    for (let i = 0; i < sorted.length; i++) {
      pages.push(sorted[i])
      // Insert ellipsis marker if there's a gap
      if (i < sorted.length - 1 && sorted[i + 1] - sorted[i] > 1) {
        pages.push('...' + i)  // unique key for the gap
      }
    }
  }

  return (
    <div className={`flex items-center justify-between gap-4 py-3 ${className}`}>
      {/* Range summary */}
      <p className="text-xs text-zinc-400 shrink-0">
        {rangeStart}–{rangeEnd} of {total}
      </p>

      {/* Page buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={prev}
          disabled={!hasPrev}
          className="h-7 w-7 flex items-center justify-center rounded text-zinc-500 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={14} />
        </button>

        {pages.map((p) =>
          typeof p === 'string' ? (
            <span key={p} className="h-7 w-7 flex items-center justify-center text-xs text-zinc-400">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => goTo(p)}
              className={`h-7 min-w-[28px] px-1.5 rounded text-xs font-medium transition-colors ${
                p === page
                  ? 'accent-bg text-white'
                  : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={next}
          disabled={!hasNext}
          className="h-7 w-7 flex items-center justify-center rounded text-zinc-500 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}