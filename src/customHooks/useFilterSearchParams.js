import { useCallback, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { setFilterBy } from '../store/gig.actions'
import { utilService } from '../services/util.service'

// The URL is the only source of truth for the Explore filter.
// Back / Forward work by themselves, because every change is a new history entry.
export function useFilterSearchParams() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = utilService.getFilterQuery(utilService.getFilterFromSearchParams(searchParams))

  const filterBy = useMemo(
    () => utilService.getFilterFromSearchParams(new URLSearchParams(query)),
    [query],
  )

  // A read-only copy in the store, for components outside the page (e.g. the active category)
  useEffect(() => {
    setFilterBy(filterBy)
  }, [filterBy])

  const setFilterParams = useCallback(
    (changes) => setSearchParams(utilService.getFilterQuery({ ...filterBy, ...changes })),
    [filterBy, setSearchParams],
  )

  return [filterBy, setFilterParams]
}
