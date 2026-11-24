export const SET_USER = 'SET_USER'
export const LOGOUT = 'LOGOUT'

const initialState = {
  user: null,
}

export function userReducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_USER:
      return { ...state, user: action.user }
    case LOGOUT:
      return { ...state, user: null }
    default:
      return state
  }
}
