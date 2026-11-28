import { describe, it, expect } from 'vitest'
import { userReducer, SET_USER, LOGOUT } from './user.reducer'

const user = { id: 'auth-1', fullname: 'Maya Cohen', email: 'maya@test.com', imgUrl: '' }

describe('userReducer', () => {
  it('starts with no user', () => {
    expect(userReducer(undefined, {})).toEqual({ user: null, isAuthChecked: false })
  })

  it('SET_USER sets the logged in user', () => {
    const state = userReducer(undefined, { type: SET_USER, user })
    expect(state).toEqual({ user, isAuthChecked: true })
  })

  it('LOGOUT clears the user', () => {
    const state = userReducer({ user, isAuthChecked: true }, { type: LOGOUT })
    expect(state).toEqual({ user: null, isAuthChecked: true })
  })

  it('marks the session as checked even when nobody is logged in', () => {
    const state = userReducer(undefined, { type: SET_USER, user: null })
    expect(state).toEqual({ user: null, isAuthChecked: true })
  })
})
