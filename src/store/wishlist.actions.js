import { wishlistService } from '../services/wishlist.service'
import { store } from './store'
import { SET_WISHLIST } from './wishlist.reducer'

let lastLoadRequestId = 0

// The logged-in user's saved gigs. A logged-out user has an empty wishlist.
// Only the latest call writes to the store, so after a quick logout / login
// the old user's list can't overwrite the new one.
export async function loadWishlist() {
  const requestId = ++lastLoadRequestId
  const user = store.getState().userModule.user
  const gigIds = user ? await wishlistService.query(user.id) : []
  if (requestId === lastLoadRequestId) store.dispatch({ type: SET_WISHLIST, gigIds })
  return gigIds
}

// Saves the gig, or removes it if it's already saved
export async function toggleWishlist(gigId) {
  const user = store.getState().userModule.user
  if (!user) throw new Error('Only a logged-in user can save gigs')

  const isSaved = store.getState().wishlistModule.gigIds.includes(gigId)
  const gigIds = isSaved
    ? await wishlistService.remove(user.id, gigId)
    : await wishlistService.add(user.id, gigId)
  store.dispatch({ type: SET_WISHLIST, gigIds })
  return gigIds
}
