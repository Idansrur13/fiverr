import { wishlistService } from '../services/wishlist.service'
import { userService } from '../services/user.service'
import { store } from './store'
import { SET_WISHLIST } from './wishlist.reducer'

// A logged-out user has an empty wishlist
export async function loadWishlist() {
  const user = userService.getLoggedinUser()
  const gigIds = user ? await wishlistService.query(user.id) : []
  store.dispatch({ type: SET_WISHLIST, gigIds })
  return gigIds
}

// Saves the gig, or removes it if it's already saved
export async function toggleWishlist(gigId) {
  const user = userService.getLoggedinUser()
  if (!user) throw new Error('Only a logged-in user can save gigs')

  const isSaved = store.getState().wishlistModule.gigIds.includes(gigId)
  const gigIds = isSaved
    ? await wishlistService.remove(user.id, gigId)
    : await wishlistService.add(user.id, gigId)
  store.dispatch({ type: SET_WISHLIST, gigIds })
  return gigIds
}
