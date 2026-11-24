import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginModal } from './LoginModal'
import { store } from '../store/store'
import { LOGOUT } from '../store/user.reducer'

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

const authUser = {
  id: 'auth-1',
  email: 'maya@test.com',
  user_metadata: { fullname: 'Maya Cohen' },
}

function renderModal(mode = 'login') {
  const onClose = vi.fn()
  const user = userEvent.setup()
  render(<LoginModal mode={mode} onClose={onClose} />)
  return { onClose, user }
}

async function fillLogin(user, { email = 'maya@test.com', password = 'secret123' } = {}) {
  await user.type(screen.getByLabelText('Email'), email)
  await user.type(screen.getByLabelText('Password'), password)
}

describe('LoginModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    store.dispatch({ type: LOGOUT })
  })

  it('renders the sign in form with email and password', () => {
    renderModal()
    expect(screen.getByRole('dialog', { name: 'Sign in to your account' })).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email')
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password')
    expect(screen.queryByLabelText('Full name')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('switches between sign in and join', async () => {
    const { user } = renderModal()

    await user.click(screen.getByRole('button', { name: 'Join here' }))
    expect(screen.getByRole('dialog', { name: 'Create a new account' })).toBeInTheDocument()
    expect(screen.getByLabelText('Full name')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Join' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(screen.getByRole('dialog', { name: 'Sign in to your account' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Full name')).not.toBeInTheDocument()
  })

  it('validates the email, password length and full name', async () => {
    const { user } = renderModal('signup')

    await user.click(screen.getByRole('button', { name: 'Join' }))
    expect(screen.getByText('Full name is required')).toBeInTheDocument()
    expect(screen.getByText('Enter a valid email')).toBeInTheDocument()
    expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Full name'), 'Maya Cohen')
    await fillLogin(user, { email: 'maya@test', password: 'short' })
    await user.click(screen.getByRole('button', { name: 'Join' }))
    expect(screen.queryByText('Full name is required')).not.toBeInTheDocument()
    expect(screen.getByText('Enter a valid email')).toBeInTheDocument()
    expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')

    expect(auth.signUp).not.toHaveBeenCalled()
  })

  it('signs in with email and password and closes', async () => {
    auth.signInWithPassword.mockResolvedValue({
      data: { user: authUser, session: { access_token: 'token' } },
      error: null,
    })
    const { onClose, user } = renderModal()

    await fillLogin(user, { email: '  maya@test.com ' })
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'maya@test.com',
      password: 'secret123',
    })
    expect(onClose).toHaveBeenCalled()
    expect(store.getState().userModule.user).toMatchObject({
      id: 'auth-1',
      email: 'maya@test.com',
      fullname: 'Maya Cohen',
    })
  })

  it('signs up with full name, email and password', async () => {
    auth.signUp.mockResolvedValue({
      data: { user: authUser, session: { access_token: 'token' } },
      error: null,
    })
    const { onClose, user } = renderModal('signup')

    await user.type(screen.getByLabelText('Full name'), 'Maya Cohen')
    await fillLogin(user)
    await user.click(screen.getByRole('button', { name: 'Join' }))

    expect(auth.signUp).toHaveBeenCalledWith({
      email: 'maya@test.com',
      password: 'secret123',
      options: { data: { fullname: 'Maya Cohen' } },
    })
    expect(onClose).toHaveBeenCalled()
    expect(store.getState().userModule.user).toMatchObject({ id: 'auth-1', fullname: 'Maya Cohen' })
  })

  it('shows the error returned by Supabase', async () => {
    auth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: new Error('Invalid login credentials'),
    })
    const { onClose, user } = renderModal()

    await fillLogin(user)
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid login credentials')
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeEnabled()
    expect(onClose).not.toHaveBeenCalled()
    expect(store.getState().userModule.user).toBeNull()
  })

  it('disables the submit button while sending', async () => {
    let resolveSignIn
    auth.signInWithPassword.mockReturnValue(
      new Promise((resolve) => {
        resolveSignIn = resolve
      }),
    )
    const { onClose, user } = renderModal()
    const submitBtn = screen.getByRole('button', { name: 'Sign in' })

    await fillLogin(user)
    await user.click(submitBtn)

    expect(submitBtn).toBeDisabled()
    expect(submitBtn).toHaveTextContent('Signing in...')
    expect(onClose).not.toHaveBeenCalled()

    resolveSignIn({ data: { user: authUser, session: {} }, error: null })
    await vi.waitFor(() => expect(onClose).toHaveBeenCalled())
  })

  it('closes on outside click and on Escape', async () => {
    const { onClose, user } = renderModal()

    await user.click(screen.getByLabelText('Email'))
    expect(onClose).not.toHaveBeenCalled()

    await user.click(document.body)
    expect(onClose).toHaveBeenCalledTimes(1)

    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(2)
  })
})
