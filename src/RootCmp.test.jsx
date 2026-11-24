import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { RootCmp } from './RootCmp'
import { routes } from './routes'
import { store } from './store/store'
import { LOGOUT, SET_USER } from './store/user.reducer'

const loggedinUser = { id: 'auth-1', email: 'maya@test.com', fullname: 'Maya Cohen', imgUrl: '' }

function renderAt(path) {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <RootCmp />
      </MemoryRouter>
    </Provider>,
  )
}

describe('RootCmp', () => {
  beforeEach(() => {
    store.dispatch({ type: LOGOUT })
  })

  it('renders the home page at /', () => {
    renderAt('/')
    expect(
      screen.getByRole('heading', { level: 1, name: /will take it from here/ }),
    ).toBeInTheDocument()
  })

  it('renders the header and footer on every page', () => {
    renderAt('/explore')
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('renders the explore page at /explore', () => {
    renderAt('/explore')
    expect(screen.getByRole('heading', { name: 'Explore' })).toBeInTheDocument()
  })

  it.each([
    ['/orders', 'My Orders'],
    ['/seller/dashboard', 'Dashboard'],
    ['/seller/gigs/new', 'Create a new gig'],
  ])('renders the protected page at %s for a logged in user', (path, heading) => {
    store.dispatch({ type: SET_USER, user: loggedinUser })
    renderAt(path)
    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument()
  })

  it('asks to sign in on a protected page when logged out', () => {
    renderAt('/orders')
    expect(screen.queryByRole('heading', { name: 'My Orders' })).not.toBeInTheDocument()
    expect(screen.getByRole('dialog', { name: 'Sign in to your account' })).toBeInTheDocument()
  })

  it('protects the orders, profile and checkout pages and every seller page', () => {
    const protectedPaths = routes.filter((route) => route.isProtected).map((route) => route.path)
    const sellerPaths = routes
      .map((route) => route.path)
      .filter((path) => path.startsWith('/seller'))

    expect(protectedPaths).toEqual(
      expect.arrayContaining(['/orders', '/orders/:orderId', '/profile', '/checkout/:gigId']),
    )
    expect(sellerPaths.length).toBeGreaterThan(0)
    sellerPaths.forEach((path) => expect(protectedPaths).toContain(path))
    expect(protectedPaths).not.toContain('/')
    expect(protectedPaths).not.toContain('/explore')
    expect(protectedPaths).not.toContain('/gig/:gigId')
  })

  it('renders the gig details page at /gig/123', () => {
    renderAt('/gig/123')
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('renders the not found page for an unknown route', () => {
    renderAt('/no-such-page')
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
  })
})
