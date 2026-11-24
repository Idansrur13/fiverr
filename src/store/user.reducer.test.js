import { describe, it, expect } from 'vitest'
import { userReducer, SET_USER, LOGOUT } from './user.reducer'

const user = { id: 'auth-1', fullname: 'Maya Cohen', email: 'maya@test.com', imgUrl: '' }

describe('userReducer', () => {
  it('starts with no user', () => {
    expect(userReducer(undefined, {})).toEqual({ user: null })
  })

  it('SET_USER sets the logged in user', () => {
    const state = userReducer(undefined, { type: SET_USER, user })
    expect(state.user).toEqual(user)
  })

  it('LOGOUT clears the user', () => {
    const state = userReducer({ user }, { type: LOGOUT })
    expect(state.user).toBeNull()
  })
})
