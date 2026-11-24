import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, act, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Provider } from 'react-redux'
import { UserMenu } from './UserMenu'
import { store } from '../store/store'
import { LOGOUT, SET_USER } from '../store/user.reducer'

const { auth } = vi.hoisted(() => ({
  auth: {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(),
  },
}))

vi.mock('../services/supabase.service', () => ({
  getSupabase: async () => ({ auth }),
  isSupabaseConfigured: () => true,
}))

const loggedinUser = {
  id: 'auth-1',
  email: 'maya@test.com',
  fullname: 'Maya Cohen',
  imgUrl: 'maya.jpg',
}

function LocationStub() {
  return <p>Page {useLocation().pathname}</p>
}

function renderMenu() {
  const onOpenLogin = vi.fn()
  const user = userEvent.setup()
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/orders']}>
        <UserMenu onOpenLogin={onOpenLogin} />
        <Routes>
          <Route path="*" element={<LocationStub />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  )
  return { onOpenLogin, user }
}

function setUser(user) {
  act(() => {
    store.dispatch({ type: SET_USER, user })
  })
}

describe('UserMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    store.dispatch({ type: LOGOUT })
  })

  it('shows Sign in and Join when logged out', async () => {
    const { onOpenLogin, user } = renderMenu()
    expect(screen.queryByRole('button', { name: 'Account menu' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(onOpenLogin).toHaveBeenLastCalledWith('login')

    await user.click(screen.getByRole('button', { name: 'Join' }))
    expect(onOpenLogin).toHaveBeenLastCalledWith('signup')
  })

  it('shows the user avatar when logged in', () => {
    renderMenu()

    setUser(loggedinUser)
    expect(screen.getByRole('img', { name: 'Maya Cohen' })).toHaveAttribute('src', 'maya.jpg')
    expect(screen.queryByRole('button', { name: 'Sign in' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Join' })).not.toBeInTheDocument()

    setUser({ ...loggedinUser, imgUrl: '' })
    expect(screen.getByRole('img', { name: 'Maya Cohen' })).toHaveTextContent('M')
  })

  it('opens the menu with Profile, Orders and Logout', async () => {
    const { user } = renderMenu()
    setUser(loggedinUser)

    const menuBtn = screen.getByRole('button', { name: 'Account menu' })
    await user.click(menuBtn)

    expect(menuBtn).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('maya@test.com')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Profile' })).toHaveAttribute('href', '/profile')
    expect(screen.getByRole('link', { name: 'Orders' })).toHaveAttribute('href', '/orders')
    expect(screen.getByRole('link', { name: 'Switch to selling' })).toHaveAttribute(
      'href',
      '/seller/dashboard',
    )
    expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument()
  })

  it('logs out and clears the user on Logout', async () => {
    auth.signOut.mockResolvedValue({ error: null })
    const { user } = renderMenu()
    setUser(loggedinUser)

    await user.click(screen.getByRole('button', { name: 'Account menu' }))
    await user.click(within(screen.getByRole('list')).getByRole('button', { name: 'Logout' }))

    expect(auth.signOut).toHaveBeenCalled()
    expect(store.getState().userModule.user).toBeNull()
    expect(await screen.findByText('Page /')).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Sign in' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Join' })).toBeInTheDocument()
  })

  it('keeps the user and shows an error when logout fails', async () => {
    auth.signOut.mockResolvedValue({ error: new Error('Network error') })
    const { user } = renderMenu()
    setUser(loggedinUser)

    await user.click(screen.getByRole('button', { name: 'Account menu' }))
    await user.click(screen.getByRole('button', { name: 'Logout' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not log out. Please try again.',
    )
    expect(store.getState().userModule.user).toEqual(loggedinUser)
    expect(screen.getByText('Page /orders')).toBeInTheDocument()
  })
})
