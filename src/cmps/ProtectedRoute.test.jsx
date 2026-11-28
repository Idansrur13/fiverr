import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, act, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { combineReducers, legacy_createStore as createStore } from 'redux'
import { ProtectedRoute } from './ProtectedRoute'
import { store } from '../store/store'
import { LOGOUT, SET_USER, userReducer } from '../store/user.reducer'

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

const loggedinUser = { id: 'auth-1', email: 'maya@test.com', fullname: 'Maya Cohen', imgUrl: '' }

function renderProtectedPage() {
  const user = userEvent.setup()
  render(
    <Provider store={store}>
      <MemoryRouter>
        <ProtectedRoute>
          <h1>My Orders</h1>
        </ProtectedRoute>
      </MemoryRouter>
    </Provider>,
  )
  return user
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    store.dispatch({ type: LOGOUT })
  })

  it('renders the page for a logged in user', () => {
    store.dispatch({ type: SET_USER, user: loggedinUser })
    renderProtectedPage()

    expect(screen.getByRole('heading', { name: 'My Orders' })).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens the login modal for a logged out user', () => {
    renderProtectedPage()

    expect(screen.getByRole('dialog', { name: 'Sign in to your account' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'My Orders' })).not.toBeInTheDocument()
  })

  it('shows the page after signing in from the modal', async () => {
    auth.signInWithPassword.mockResolvedValue({
      data: {
        user: { id: 'auth-1', email: 'maya@test.com', user_metadata: { fullname: 'Maya Cohen' } },
      },
      error: null,
    })
    const user = renderProtectedPage()

    const loginDialog = screen.getByRole('dialog', { name: 'Sign in to your account' })
    await user.type(within(loginDialog).getByLabelText('Email'), 'maya@test.com')
    await user.type(within(loginDialog).getByLabelText('Password'), 'secret123')
    await user.click(within(loginDialog).getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('heading', { name: 'My Orders' })).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('lets the user open the modal again after closing it', async () => {
    const user = renderProtectedPage()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Sign in to continue' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/')

    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(screen.getByRole('dialog', { name: 'Sign in to your account' })).toBeInTheDocument()
  })

  it('waits for the saved session before deciding', () => {
    const appStartStore = createStore(combineReducers({ userModule: userReducer }))
    render(
      <Provider store={appStartStore}>
        <MemoryRouter>
          <ProtectedRoute>
            <h1>My Orders</h1>
          </ProtectedRoute>
        </MemoryRouter>
      </Provider>,
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'My Orders' })).not.toBeInTheDocument()

    act(() => {
      appStartStore.dispatch({ type: SET_USER, user: loggedinUser })
    })
    expect(screen.getByRole('heading', { name: 'My Orders' })).toBeInTheDocument()
  })
})
