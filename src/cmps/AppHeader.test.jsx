import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, act, within } from '@testing-library/react'
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

function scrollWindowTo(y) {
  act(() => {
    Object.defineProperty(window, 'scrollY', { value: y, configurable: true, writable: true })
    window.dispatchEvent(new Event('scroll'))
  })
}

describe('AppHeader', () => {
  afterEach(() => {
    scrollWindowTo(0)
  })

  it('hides only the search at the top of the home page', () => {
    renderHeaderAt('/')
    const header = screen.getByRole('banner')
    expect(header).toHaveClass('home-header')
    expect(header).not.toHaveClass('scrolled')
    expect(screen.queryByRole('search')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'makerr' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Orders' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Join' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Categories' })).toBeInTheDocument()
  })

  it('shows the search after scrolling on the home page', () => {
    renderHeaderAt('/')

    scrollWindowTo(200)
    expect(screen.getByRole('banner')).toHaveClass('scrolled')
    expect(screen.getByRole('search')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Categories' })).toBeInTheDocument()

    scrollWindowTo(0)
    expect(screen.getByRole('banner')).not.toHaveClass('scrolled')
    expect(screen.queryByRole('search')).not.toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Categories' })).toBeInTheDocument()
  })

  it('always shows the search on other pages', () => {
    renderHeaderAt('/explore')
    const header = screen.getByRole('banner')
    expect(header).not.toHaveClass('home-header')
    expect(header).not.toHaveClass('scrolled')
    expect(screen.getByRole('search')).toBeInTheDocument()
  })

  it('hides the search bar on the home page', () => {
    renderHeaderAt('/')
    expect(screen.queryByRole('search')).not.toBeInTheDocument()
  })

  it('shows the search bar on /explore', () => {
    renderHeaderAt('/explore')
    expect(screen.getByRole('search')).toBeInTheDocument()
  })

  it('shows the orders button', () => {
    renderHeaderAt('/')
    expect(screen.getByRole('button', { name: 'Orders' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('renders Become a Seller in the nav', () => {
    renderHeaderAt('/')
    const nav = screen.getByRole('banner').querySelector('.main-nav')
    expect(within(nav).getByRole('link', { name: 'Become a Seller' })).toHaveAttribute(
      'href',
      '/seller/dashboard',
    )
    expect(screen.queryByText('Freelance on Fiverr')).not.toBeInTheDocument()
  })

  it('links the logo to the home page', () => {
    renderHeaderAt('/explore')
    const logo = screen.getByRole('link', { name: 'makerr' })
    expect(logo).toHaveAttribute('href', '/')
    expect(within(logo).getByRole('img', { name: 'makerr' })).toBeInTheDocument()
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
    await user.click(screen.getByRole('button', { name: 'Join makerr' }))

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
    expect(screen.queryByRole('button', { name: 'Join makerr' })).not.toBeInTheDocument()

    store.dispatch({ type: LOGOUT })
  })
})
