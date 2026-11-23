import { storageService } from './storage.service'
import { reviewService } from './review.service'

const DEMO_USER = {
  id: 'u100',
  fullname: 'Guest Seller',
  imgUrl: 'https://i.pravatar.cc/150?img=68',
  level: 'NEW',
  rating: 0,
}

const GIG_STORAGE_KEY = 'gigDB'

// One set of level texts for the whole app (cards, gig page, seller profile)
const LEVEL_LABELS = {
  NEW: 'New Seller',
  LEVEL_1: 'Level 1',
  LEVEL_2: 'Level 2',
  TOP_RATED: 'Top Rated',
}

export const userService = {
  getLoggedinUser,
  getById,
  getLevelLabel,
}

function getLoggedinUser() {
  return { ...DEMO_USER }
}

function getLevelLabel(level) {
  return LEVEL_LABELS[level] || ''
}

// A seller's public profile in the same shape as GET /api/users/[id]. Until the frontend
// moves to the API (after #36), it's built from the local gigs: the owner of the gigs,
// the rating over all their reviews, and their ACTIVE gigs.
// An unknown user throws an error with status 404, so the page can tell it from other errors.
async function getById(userId) {
  const gigs = await storageService.query(GIG_STORAGE_KEY)
  const sellerGigs = gigs.filter((gig) => gig.owner?.id === userId)
  if (!sellerGigs.length) {
    const err = new Error(`Cannot find user ${userId}`)
    err.status = 404
    throw err
  }

  const { id, fullname, imgUrl, level, about, country, languages, createdAt } = sellerGigs[0].owner
  const { avg, total } = reviewService.getStats(sellerGigs.flatMap((gig) => gig.reviews ?? []))

  return {
    id,
    fullname,
    imgUrl,
    level,
    about,
    country,
    languages: languages ?? [],
    createdAt,
    rating: total ? avg : null,
    reviewsCount: total,
    gigs: sellerGigs.filter((gig) => gig.status === 'ACTIVE'),
  }
}
