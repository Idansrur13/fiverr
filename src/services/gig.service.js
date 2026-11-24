import { storageService } from './storage.service'
import { userService } from './user.service'
import { httpService } from './http.service'

const STORAGE_KEY = 'gigDB'
const PAGE_SIZE = 12

export const gigService = {
  query,
  queryPage,
  getById,
  save,
  remove,
  getDefaultFilter,
  getEmptyGig,
}

async function query(filterBy = {}) {
  const { txt = '', category, minPrice, maxPrice, daysToMake } = filterBy
  const gigs = await storageService.query(STORAGE_KEY)
  const search = txt.trim().toLowerCase()

  return gigs.filter(
    (gig) =>
      (!search || gig.title.toLowerCase().includes(search)) &&
      (!category || gig.category === category) &&
      (!minPrice || gig.price >= +minPrice) &&
      (!maxPrice || gig.price <= +maxPrice) &&
      (!daysToMake || gig.daysToMake <= +daysToMake),
  )
}

// The same sort + paging as GET /api/gigs, so Explore can switch to the API with one line.
// No sortBy = recommended. A page after the last one returns the last page.
async function queryPage(filterBy = {}) {
  const gigs = sortGigs(await query(filterBy), filterBy.sortBy)
  const total = gigs.length
  const pageCount = Math.ceil(total / PAGE_SIZE)
  const page = Math.min(Math.max(parseInt(filterBy.page) || 1, 1), Math.max(pageCount, 1))
  const start = (page - 1) * PAGE_SIZE
  return { gigs: gigs.slice(start, start + PAGE_SIZE), total, page, pageCount }
}

// Ties always end with the newest gig, like the API
function sortGigs(gigs, sortBy) {
  const comparers = {
    recommended: [getAvgRating, (gig) => gig.reviews?.length ?? 0],
    // The demo data has no orders per gig. Every review comes from a completed order
    // (that's how the DB seed builds them), so the reviews count stands in for it.
    'best-selling': [(gig) => gig.reviews?.length ?? 0],
    newest: [],
  }
  const getters = [...(comparers[sortBy] ?? comparers.recommended), (gig) => gig.createdAt ?? 0]

  return [...gigs].sort((a, b) => {
    for (const getValue of getters) {
      const diff = getValue(b) - getValue(a)
      if (diff) return diff
    }
    return 0
  })
}

// A gig with no reviews comes after every rated gig (like NULLS LAST in the API)
function getAvgRating(gig) {
  const reviews = gig.reviews ?? []
  if (!reviews.length) return -1
  return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
}

async function getById(gigId) {
  try {
    return await httpService.get(`gigs/${encodeURIComponent(gigId)}`)
  } catch (cause) {
    const status = cause?.response?.status
    const error = new Error(
      cause?.response?.data?.error ||
        (status === 400
          ? 'Invalid gig id'
          : status === 404
            ? 'Gig not found'
            : status
              ? 'Failed to load gig'
              : 'Unable to connect while loading gig'),
      { cause },
    )
    error.status = status
    error.code =
      status === 400
        ? 'INVALID_ID'
        : status === 404
          ? 'NOT_FOUND'
          : status
            ? 'HTTP_ERROR'
            : 'NETWORK_ERROR'
    throw error
  }
}

function save(gig) {
  if (gig.id) return storageService.put(STORAGE_KEY, gig)
  return storageService.post(STORAGE_KEY, { ...gig, createdAt: Date.now() })
}

function remove(gigId) {
  return storageService.remove(STORAGE_KEY, gigId)
}

function getDefaultFilter() {
  return {
    txt: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    daysToMake: '',
    sortBy: '',
    page: '',
  }
}

function getEmptyGig() {
  return {
    title: '',
    price: '',
    daysToMake: 3,
    category: 'graphics-design',
    images: ['https://picsum.photos/seed/new-gig/800/500'],
    description: '',
    owner: userService.getLoggedinUser(),
    reviews: [],
    status: 'ACTIVE',
  }
}
