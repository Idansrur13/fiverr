import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AppFooter } from './AppFooter'

const CATEGORY_NAMES = [
  'Graphics & Design',
  'Programming & Tech',
  'Digital Marketing',
  'Video & Animation',
  'Writing & Translation',
  'Music & Audio',
  'Business',
  'AI Services',
]

function ExploreStub() {
  return <h1>Explore page {useLocation().search}</h1>
}

function renderFooter({ isMobile = false } = {}) {
  vi.stubGlobal('matchMedia', (query) => ({
    matches: isMobile,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }))
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<h1>Home page</h1>} />
        <Route path="/explore" element={<ExploreStub />} />
      </Routes>
      <AppFooter />
    </MemoryRouter>,
  )
}

describe('AppFooter', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders the footer columns and links', () => {
    renderFooter()

    ;['Categories', 'For Clients', 'For Freelancers'].forEach((title) => {
      expect(screen.getByRole('heading', { name: title })).toBeInTheDocument()
    })
    CATEGORY_NAMES.forEach((name) => {
      expect(screen.getByRole('link', { name })).toBeInTheDocument()
    })
    expect(screen.getByRole('link', { name: 'Explore' })).toHaveAttribute('href', '/explore')
    expect(screen.getByRole('link', { name: 'My orders' })).toHaveAttribute('href', '/orders')
    expect(screen.getByRole('link', { name: 'Become a seller' })).toHaveAttribute(
      'href',
      '/seller/dashboard',
    )
    expect(screen.getByRole('link', { name: 'My gigs' })).toHaveAttribute('href', '/seller/gigs')
    // A page that doesn't exist yet is shown without a link
    expect(screen.getByText('How it works')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'How it works' })).not.toBeInTheDocument()
    expect(screen.getByText(/Fiverr clone/)).toBeInTheDocument()
  })

  it('navigates to explore filtered by category', async () => {
    const user = userEvent.setup()
    renderFooter()

    await user.click(screen.getByRole('link', { name: 'Music & Audio' }))

    expect(
      screen.getByRole('heading', { name: 'Explore page ?category=music-audio' }),
    ).toBeInTheDocument()
  })

  it('toggles a column on mobile', async () => {
    const user = userEvent.setup()
    renderFooter({ isMobile: true })
    const toggle = screen.getByRole('button', { name: 'Categories' })

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('link', { name: 'Music & Audio' })).not.toBeInTheDocument()

    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('link', { name: 'Music & Audio' })).toBeInTheDocument()
    // Only the clicked column opens
    expect(screen.queryByRole('link', { name: 'My orders' })).not.toBeInTheDocument()

    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('link', { name: 'Music & Audio' })).not.toBeInTheDocument()
  })
})
