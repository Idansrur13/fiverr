import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { setFilterBy } from '../store/gig.actions'
import { gigService } from '../services/gig.service'

const FILTER_KEYS = Object.keys(gigService.getDefaultFilter())

export function useFilterSearchParams() {
  const filterBy = useSelector((storeState) => storeState.gigModule.filterBy)
  const [searchParams, setSearchParams] = useSearchParams()
  const lastSyncedQuery = useRef(null)
  const hasMounted = useRef(false)

  // URL -> store: on load, and when Back / Forward changes the URL
  useEffect(() => {
    const urlFilter = getFilterFromParams(searchParams)
    const urlQuery = toQuery(urlFilter)
    if (urlQuery === lastSyncedQuery.current) return

    if (!hasMounted.current && !urlQuery) {
      // Arrived without params (e.g. from the header search): keep the store filter
      const storeQuery = toQuery(filterBy)
      setSearchParams(storeQuery, { replace: true })
      lastSyncedQuery.current = storeQuery
      return
    }

    setFilterBy(urlFilter)
    lastSyncedQuery.current = urlQuery
    // Runs only when the URL changes. filterBy is read once, on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // Store -> URL: every filter change adds a history entry
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true
      return
    }
    const storeQuery = toQuery(filterBy)
    if (storeQuery === lastSyncedQuery.current) return
    setSearchParams(storeQuery)
    lastSyncedQuery.current = storeQuery
    // Runs only when the store filter changes. setSearchParams changes on every URL
    // change, and running here then (with the old filter) would undo Back / Forward.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterBy])

  // Leaving Explore clears the filter
  useEffect(() => {
    return () => {
      lastSyncedQuery.current = null
      hasMounted.current = false
      setFilterBy(gigService.getDefaultFilter())
    }
  }, [])
}

function getFilterFromParams(searchParams) {
  const filter = gigService.getDefaultFilter()
  FILTER_KEYS.forEach((key) => {
    filter[key] = searchParams.get(key) || ''
  })
  return filter
}

function toQuery(filter) {
  const params = new URLSearchParams()
  FILTER_KEYS.forEach((key) => {
    const value = String(filter[key] ?? '').trim()
    if (value) params.set(key, value)
  })
  return params.toString()
}
