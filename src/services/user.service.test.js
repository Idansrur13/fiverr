import { describe, it, expect, beforeEach, vi } from 'vitest'
import { userService } from './user.service'
import demoGigs from '../data/gigs.json'

const { auth } = vi.hoisted(() => ({
  auth: {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(),
  },
}))

vi.mock('./supabase.service', () => ({
  getSupabase: async () => ({ auth }),
  isSupabaseConfigured: () => true,
}))

const authUser = {
  id: 'auth-1',
  email: 'maya@test.com',
  user_metadata: { fullname: 'Maya Cohen' },
}

describe('userService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('getLevelLabel returns one label per level, and nothing for an unknown level', () => {
    expect(userService.getLevelLabel('NEW')).toBe('New Seller')
    expect(userService.getLevelLabel('LEVEL_1')).toBe('Level 1')
    expect(userService.getLevelLabel('LEVEL_2')).toBe('Level 2')
    expect(userService.getLevelLabel('TOP_RATED')).toBe('Top Rated')
    expect(userService.getLevelLabel('SOMETHING_ELSE')).toBe('')
  })

  it('getById returns the seller, the rating over all their reviews and their gigs', async () => {
    const sellerGigs = demoGigs.filter((gig) => gig.owner.id === 'u101')
    const reviews = sellerGigs.flatMap((gig) => gig.reviews)

    const seller = await userService.getById('u101')

    expect(seller).toMatchObject({
      id: 'u101',
      fullname: sellerGigs[0].owner.fullname,
      level: sellerGigs[0].owner.level,
      reviewsCount: reviews.length,
      languages: [],
    })
    expect(seller.gigs.map((gig) => gig.id).sort()).toEqual(sellerGigs.map((gig) => gig.id).sort())
  })

  it('getById leaves out gigs that are not active', async () => {
    const sellerGigs = demoGigs.filter((gig) => gig.owner.id === 'u101')
    const pausedGig = { ...sellerGigs[0], id: 'paused-gig', status: 'PAUSED' }
    localStorage.setItem('gigDB', JSON.stringify([...demoGigs, pausedGig]))

    const seller = await userService.getById('u101')

    expect(seller.gigs.map((gig) => gig.id)).not.toContain('paused-gig')
    expect(seller.gigs).toHaveLength(sellerGigs.length)
  })

  it('getById rejects with status 404 for an unknown user', async () => {
    await expect(userService.getById('no-such-user')).rejects.toMatchObject({ status: 404 })
  })
})

describe('userService auth', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    auth.signOut.mockResolvedValue({ error: null })
    await userService.logout()
  })

  it('getLoggedinUser returns the demo user when nobody is logged in', () => {
    expect(userService.getLoggedinUser()).toMatchObject({ id: 'u100', fullname: 'Guest Seller' })
  })

  it('login returns the user with the full name from the metadata and keeps them logged in', async () => {
    auth.signInWithPassword.mockResolvedValue({ data: { user: authUser }, error: null })

    const user = await userService.login({ email: 'maya@test.com', password: 'secret123' })

    expect(user).toEqual({
      id: 'auth-1',
      email: 'maya@test.com',
      fullname: 'Maya Cohen',
      imgUrl: '',
      level: 'NEW',
      rating: 0,
    })
    expect(userService.getLoggedinUser()).toEqual(user)
  })

  it('login throws the error from Supabase', async () => {
    auth.signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: new Error('Invalid login credentials'),
    })

    await expect(
      userService.login({ email: 'maya@test.com', password: 'wrong-pass' }),
    ).rejects.toThrow('Invalid login credentials')
    expect(userService.getLoggedinUser().id).toBe('u100')
  })

  it('signup sends the full name in the user metadata', async () => {
    auth.signUp.mockResolvedValue({ data: { user: authUser, session: {} }, error: null })

    const user = await userService.signup({
      fullname: 'Maya Cohen',
      email: 'maya@test.com',
      password: 'secret123',
    })

    expect(auth.signUp).toHaveBeenCalledWith({
      email: 'maya@test.com',
      password: 'secret123',
      options: { data: { fullname: 'Maya Cohen' } },
    })
    expect(user.fullname).toBe('Maya Cohen')
  })

  it('signup asks to confirm the email when Supabase returns no session', async () => {
    auth.signUp.mockResolvedValue({ data: { user: authUser, session: null }, error: null })

    await expect(
      userService.signup({ fullname: 'Maya Cohen', email: 'maya@test.com', password: 'secret123' }),
    ).rejects.toThrow('Check your email to confirm your account, then sign in.')
  })

  it('logout goes back to the demo user', async () => {
    auth.signInWithPassword.mockResolvedValue({ data: { user: authUser }, error: null })
    await userService.login({ email: 'maya@test.com', password: 'secret123' })

    await userService.logout()

    expect(auth.signOut).toHaveBeenCalled()
    expect(userService.getLoggedinUser().id).toBe('u100')
  })

  it('getSessionUser restores the user from the saved session', async () => {
    auth.getSession.mockResolvedValue({ data: { session: { user: authUser } }, error: null })

    expect(await userService.getSessionUser()).toMatchObject({
      id: 'auth-1',
      fullname: 'Maya Cohen',
    })
    expect(userService.getLoggedinUser().id).toBe('auth-1')
  })

  it('onAuthChange reports the user on every auth change and can unsubscribe', async () => {
    const unsubscribe = vi.fn()
    auth.onAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe } } })
    const onChange = vi.fn()

    const stopListening = userService.onAuthChange(onChange)
    await vi.waitFor(() => expect(auth.onAuthStateChange).toHaveBeenCalled())
    const [[authCallback]] = auth.onAuthStateChange.mock.calls

    authCallback('SIGNED_IN', { user: authUser })
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'auth-1' }))

    authCallback('SIGNED_OUT', null)
    expect(onChange).toHaveBeenLastCalledWith(null)

    stopListening()
    expect(unsubscribe).toHaveBeenCalled()
  })

  it('onAuthChange does not subscribe when it is stopped before Supabase loads', async () => {
    const onChange = vi.fn()

    const stopListening = userService.onAuthChange(onChange)
    stopListening()
    await Promise.resolve()
    await Promise.resolve()

    expect(auth.onAuthStateChange).not.toHaveBeenCalled()
  })
})
