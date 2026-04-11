import { useState, useMemo } from 'react'

export function usePagination(items, pageSize = 10) {
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))

  // Reset to page 1 whenever the items list changes length (e.g. after filter)
  const safePage = Math.min(page, totalPages)

  const paginated = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return items.slice(start, start + pageSize)
  }, [items, safePage, pageSize])

  const goTo    = (n) => setPage(Math.max(1, Math.min(n, totalPages)))
  const prev    = () => goTo(safePage - 1)
  const next    = () => goTo(safePage + 1)
  const reset   = () => setPage(1)

  return {
    page: safePage,
    totalPages,
    paginated,
    goTo,
    prev,
    next,
    reset,
    hasPrev: safePage > 1,
    hasNext: safePage < totalPages,
    rangeStart: (safePage - 1) * pageSize + 1,
    rangeEnd: Math.min(safePage * pageSize, items.length),
    total: items.length,
  }
}