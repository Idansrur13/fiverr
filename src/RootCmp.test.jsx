import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { RootCmp } from './RootCmp'
import { store } from './store/store'

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

  it.each([
    ['/explore', 'Explore'],
    ['/gig/123', 'Gig Details'],
    ['/orders', 'My Orders'],
    ['/seller/dashboard', 'Dashboard'],
    ['/seller/gigs/new', 'Create a new gig'],
  ])('renders the right page at %s', (path, heading) => {
    renderAt(path)
    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument()
  })

  it('renders the not found page for an unknown route', () => {
    renderAt('/no-such-page')
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
  })
})
