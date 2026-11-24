export const SET_USER = 'SET_USER'
export const LOGOUT = 'LOGOUT'

const initialState = {
  user: null,
  isAuthChecked: false,
}

export function userReducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_USER:
      return { ...state, user: action.user, isAuthChecked: true }
    case LOGOUT:
      return { ...state, user: null, isAuthChecked: true }
    default:
      return state
  }
}
