import { useCallback, useState } from 'react'

interface UsePaginationOptions {
  initialLimit?: number
  initialOffset?: number
}

export function usePagination(options?: UsePaginationOptions) {
  const limit = options?.initialLimit ?? 20
  const initialOffset = options?.initialOffset ?? 0

  const [offset, setOffset] = useState(initialOffset)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const handleLoadMore = useCallback(
    (onLoadMore: (limit: number, offset: number) => Promise<{ count: number; total: number }>) => {
      return async () => {
        if (!hasMore || isLoadingMore) return

        setIsLoadingMore(true)
        try {
          const newOffset = offset + limit
          const result = await onLoadMore(limit, newOffset)

          setOffset(newOffset)

          // Check if we've loaded all items
          if (newOffset + limit >= result.total) {
            setHasMore(false)
          }
        } finally {
          setIsLoadingMore(false)
        }
      }
    },
    [offset, limit, hasMore, isLoadingMore]
  )

  const reset = useCallback(() => {
    setOffset(initialOffset)
    setHasMore(true)
    setIsLoadingMore(false)
  }, [initialOffset])

  return {
    offset,
    limit,
    hasMore,
    isLoadingMore,
    handleLoadMore,
    reset,
  }
}
