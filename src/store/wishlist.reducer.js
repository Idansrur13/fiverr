export const SET_WISHLIST = 'SET_WISHLIST'

const initialState = {
  // The logged-in user's saved gigs
  gigIds: [],
}

export function wishlistReducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_WISHLIST:
      return { ...state, gigIds: action.gigIds }
    default:
      return state
  }
}
