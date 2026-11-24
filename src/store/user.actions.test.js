import { describe, it, expect, beforeEach, vi } from 'vitest'
import { login, logout, listenToAuthChanges } from './user.actions'
import { store } from './store'
import { LOGOUT } from './user.reducer'
import { SET_BUYER_ORDERS } from './order.reducer'

const { auth } = vi.hoisted(() => ({
  auth: {
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn(),
  },
}))

vi.mock('../services/supabase.service', () => ({
  getSupabase: async () => ({ auth }),
  isSupabaseConfigured: () => true,
}))

const maya = { id: 'auth-1', email: 'maya@test.com', user_metadata: { fullname: 'Maya Cohen' } }
const noa = { id: 'auth-2', email: 'noa@test.com', user_metadata: { fullname: 'Noa Levi' } }
const buyerOrders = [{ id: 'o1', buyer: { id: 'auth-1' }, status: 'PENDING' }]

function setBuyerOrders() {
  store.dispatch({ type: SET_BUYER_ORDERS, buyerOrders })
}

describe('user actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    auth.signOut.mockResolvedValue({ error: null })
    store.dispatch({ type: LOGOUT })
    store.dispatch({ type: SET_BUYER_ORDERS, buyerOrders: [] })
  })

  it('clears the header buyer orders on logout', async () => {
    auth.signInWithPassword.mockResolvedValue({ data: { user: maya }, error: null })
    await login({ email: 'maya@test.com', password: 'secret123' })
    setBuyerOrders()

    await logout()

    expect(store.getState().userModule.user).toBeNull()
    expect(store.getState().orderModule.buyerOrders).toEqual([])
  })

  it('clears the buyer orders when another user logs in, and keeps them for the same user', async () => {
    auth.onAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } })
    const stopListening = listenToAuthChanges()
    await vi.waitFor(() => expect(auth.onAuthStateChange).toHaveBeenCalled())
    const [[authCallback]] = auth.onAuthStateChange.mock.calls

    authCallback('SIGNED_IN', { user: maya })
    setBuyerOrders()

    authCallback('TOKEN_REFRESHED', { user: maya })
    expect(store.getState().orderModule.buyerOrders).toEqual(buyerOrders)

    authCallback('SIGNED_IN', { user: noa })
    expect(store.getState().userModule.user.id).toBe('auth-2')
    expect(store.getState().orderModule.buyerOrders).toEqual([])

    stopListening()
  })
})
