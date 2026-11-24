import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { AppHeader } from './AppHeader'
import { store } from '../store/store'
import userEvent from '@testing-library/user-event'
import { LOGOUT, SET_USER } from '../store/user.reducer'

function renderHeaderAt(path) {
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <AppHeader />
      </MemoryRouter>
    </Provider>,
  )
}

describe('AppHeader', () => {
  it('hides the search bar on the home page', () => {
    renderHeaderAt('/')
    expect(screen.queryByRole('search')).not.toBeInTheDocument()
  })

  it('shows the search bar on /explore', () => {
    renderHeaderAt('/explore')
    expect(screen.getByRole('search')).toBeInTheDocument()
  })

  it('links to the orders page and the seller dashboard', () => {
    renderHeaderAt('/')
    expect(screen.getByRole('link', { name: 'Orders' })).toHaveAttribute('href', '/orders')
    expect(screen.getByRole('link', { name: 'Freelance on Fiverr' })).toHaveAttribute(
      'href',
      '/seller/dashboard',
    )
  })
})

describe('AppHeader login', () => {
  it('opens the login modal from Sign in and from Join', async () => {
    store.dispatch({ type: LOGOUT })
    const user = userEvent.setup()
    renderHeaderAt('/explore')

    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(screen.getByRole('dialog', { name: 'Sign in to your account' })).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Join' }))
    expect(screen.getByRole('dialog', { name: 'Create a new account' })).toBeInTheDocument()
  })

  it('opens the login modal from the mobile menu', async () => {
    store.dispatch({ type: LOGOUT })
    const user = userEvent.setup()
    renderHeaderAt('/')

    await user.click(screen.getByRole('button', { name: 'Open menu' }))
    await user.click(screen.getByRole('button', { name: 'Join Fiverr' }))

    expect(screen.queryByRole('dialog', { name: 'Menu' })).not.toBeInTheDocument()
    expect(screen.getByRole('dialog', { name: 'Create a new account' })).toBeInTheDocument()
  })

  it('shows the account menu instead of Sign in and Join when logged in', async () => {
    store.dispatch({
      type: SET_USER,
      user: { id: 'auth-1', email: 'maya@test.com', fullname: 'Maya Cohen', imgUrl: '' },
    })
    const user = userEvent.setup()
    renderHeaderAt('/explore')

    expect(screen.getByRole('button', { name: 'Account menu' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Sign in' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Open menu' }))
    expect(screen.queryByRole('button', { name: 'Join Fiverr' })).not.toBeInTheDocument()

    store.dispatch({ type: LOGOUT })
  })
})
