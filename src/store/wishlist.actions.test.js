import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { loadWishlist } from './wishlist.actions'
import { store } from './store'
import { LOGOUT, SET_USER } from './user.reducer'
import { SET_WISHLIST } from './wishlist.reducer'
import { wishlistService } from '../services/wishlist.service'

const maya = { id: 'auth-1', email: 'maya@test.com', fullname: 'Maya Cohen', imgUrl: '' }
const noa = { id: 'auth-2', email: 'noa@test.com', fullname: 'Noa Levi', imgUrl: '' }

describe('wishlist actions', () => {
  beforeEach(() => {
    localStorage.clear()
    store.dispatch({ type: SET_WISHLIST, gigIds: [] })
    localStorage.setItem(`wishlist_${maya.id}`, JSON.stringify(['g101']))
    localStorage.setItem(`wishlist_${noa.id}`, JSON.stringify(['g103']))
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('loads the wishlist of the logged-in user, and an empty one when logged out', async () => {
    store.dispatch({ type: SET_USER, user: maya })
    await loadWishlist()
    expect(store.getState().wishlistModule.gigIds).toEqual(['g101'])

    store.dispatch({ type: LOGOUT })
    await loadWishlist()
    expect(store.getState().wishlistModule.gigIds).toEqual([])
  })

  it("ignores an old user's wishlist that arrives after the new user's", async () => {
    let resolveMaya
    vi.spyOn(wishlistService, 'query').mockImplementation((userId) =>
      userId === maya.id
        ? new Promise((resolve) => (resolveMaya = () => resolve(['g101'])))
        : Promise.resolve(['g103']),
    )

    store.dispatch({ type: SET_USER, user: maya })
    const mayaLoad = loadWishlist()
    store.dispatch({ type: SET_USER, user: noa })
    await loadWishlist()
    resolveMaya()
    await mayaLoad

    expect(store.getState().wishlistModule.gigIds).toEqual(['g103'])
  })
})
