import { gigService } from './gig.service'

const FILTER_KEYS = Object.keys(gigService.getDefaultFilter())

export const utilService = {
  getFilterFromSearchParams,
  getFilterQuery,
  getExploreUrl,
}

function getFilterFromSearchParams(searchParams) {
  const filter = gigService.getDefaultFilter()
  FILTER_KEYS.forEach((key) => {
    filter[key] = searchParams.get(key) || ''
  })
  return filter
}

// Always the same key order, and empty values are left out
function getFilterQuery(filter) {
  const params = new URLSearchParams()
  FILTER_KEYS.forEach((key) => {
    const value = String(filter[key] ?? '').trim()
    if (value) params.set(key, value)
  })
  return params.toString()
}

function getExploreUrl(filter = {}) {
  const query = getFilterQuery(filter)
  return query ? `/explore?${query}` : '/explore'
}
