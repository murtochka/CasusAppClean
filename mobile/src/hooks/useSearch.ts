import { useCallback } from 'react'
import { useSearchStore } from '../store/searchStore'
import { SearchFiltersRequest } from '../types/search'

export function useSearch() {
  const { metadata, results, filters, pagination, isLoading, error, clearError, loadMetadata, search, setFilters, resetFilters, loadMore } = useSearchStore()

  const searchActivities = useCallback(
    (newFilters?: SearchFiltersRequest) => {
      const filtersToUse = newFilters !== undefined ? newFilters : filters
      search(filtersToUse)
    },
    [filters, search]
  )

  return {
    metadata,
    results,
    filters,
    pagination,
    isLoading,
    error,
    clearError,
    loadMetadata,
    search: searchActivities,
    setFilters,
    resetFilters,
    loadMore,
  }
}
