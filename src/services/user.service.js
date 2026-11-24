import { storageService } from './storage.service'
import { reviewService } from './review.service'
import { getSupabase, isSupabaseConfigured } from './supabase.service'

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

let loggedinUser = null

export const userService = {
  getLoggedinUser,
  login,
  signup,
  logout,
  getSessionUser,
  onAuthChange,
  getAccessToken,
  getById,
  getLevelLabel,
}

function getLoggedinUser() {
  return { ...(loggedinUser || DEMO_USER) }
}

async function login({ email, password }) {
  const supabase = await getSupabase()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return _setLoggedinUser(data.user)
}

async function signup({ fullname, email, password }) {
  const supabase = await getSupabase()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { fullname } },
  })
  if (error) throw error
  if (!data.session) throw new Error('Check your email to confirm your account, then sign in.')
  return _setLoggedinUser(data.user)
}

async function logout() {
  if (isSupabaseConfigured()) {
    const supabase = await getSupabase()
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }
  _setLoggedinUser(null)
}

async function getSessionUser() {
  if (!isSupabaseConfigured()) return null
  const supabase = await getSupabase()
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return _setLoggedinUser(data.session?.user)
}

function onAuthChange(onChange) {
  if (!isSupabaseConfigured()) return () => {}
  let subscription = null
  let isStopped = false

  getSupabase().then((supabase) => {
    if (isStopped) return
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      onChange(_setLoggedinUser(session?.user))
    })
    subscription = data.subscription
  })

  return () => {
    isStopped = true
    subscription?.unsubscribe()
  }
}

async function getAccessToken() {
  if (!isSupabaseConfigured()) return null
  const supabase = await getSupabase()
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

function _setLoggedinUser(authUser) {
  loggedinUser = authUser ? _toUser(authUser) : null
  return loggedinUser && { ...loggedinUser }
}

function _toUser({ id, email, user_metadata: metadata = {} }) {
  return {
    id,
    email,
    fullname: metadata.fullname || (email || '').split('@')[0],
    imgUrl: metadata.imgUrl || '',
    level: 'NEW',
    rating: 0,
  }
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
