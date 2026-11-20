import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { RootCmp } from './RootCmp'

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <RootCmp />
    </MemoryRouter>,
  )
}

describe('RootCmp', () => {
  it('renders the home page at /', () => {
    renderAt('/')
    expect(screen.getByRole('heading', { name: 'Home' })).toBeInTheDocument()
  })

  it('renders the header and footer on every page', () => {
    renderAt('/explore')
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it.each([
    ['/explore', 'Explore'],
    ['/orders', 'My Orders'],
    ['/seller/dashboard', 'Dashboard'],
    ['/seller/gigs/new', 'Create a new gig'],
  ])('renders the right page at %s', (path, heading) => {
    renderAt(path)
    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument()
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