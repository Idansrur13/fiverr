import { StrictMode } from 'react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { WishlistPage } from './WishlistPage'
import { store } from '../store/store'
import { loadWishlist } from '../store/wishlist.actions'
import { SET_WISHLIST } from '../store/wishlist.reducer'
import { userService } from '../services/user.service'
import { gigService } from '../services/gig.service'
import demoGigs from '../data/gigs.json'

const userId = userService.getLoggedinUser().id
const savedGigs = demoGigs.filter((gig) => ['g101', 'g103'].includes(gig.id))

function renderPage() {
  render(
    <StrictMode>
      <Provider store={store}>
        <MemoryRouter initialEntries={['/wishlist']}>
          <WishlistPage />
        </MemoryRouter>
      </Provider>
    </StrictMode>,
  )
}

async function saveGigs(gigIds) {
  localStorage.setItem(`wishlist_${userId}`, JSON.stringify(gigIds))
  await loadWishlist()
}

describe('WishlistPage', () => {
  beforeEach(() => {
    localStorage.clear()
    store.dispatch({ type: SET_WISHLIST, gigIds: [] })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the saved gigs', async () => {
    await saveGigs(savedGigs.map((gig) => gig.id))
    renderPage()

    expect(await screen.findAllByRole('article')).toHaveLength(savedGigs.length)
    savedGigs.forEach((gig) => {
      expect(screen.getByRole('heading', { name: gig.title })).toBeInTheDocument()
    })
    screen.getAllByRole('button', { name: 'Remove from wishlist' }).forEach((heart) => {
      expect(heart).toHaveAttribute('aria-pressed', 'true')
    })
    const otherGig = demoGigs.find((gig) => !savedGigs.includes(gig))
    expect(screen.queryByRole('heading', { name: otherGig.title })).not.toBeInTheDocument()
  })

  it('renders an empty state', async () => {
    renderPage()

    expect(
      await screen.findByRole('heading', { name: 'Your wishlist is empty' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Explore gigs' })).toHaveAttribute('href', '/explore')
    expect(screen.queryByRole('article')).not.toBeInTheDocument()
  })

  it('shows an error when the gigs fail to load', async () => {
    await saveGigs(['g101'])
    vi.spyOn(gigService, 'query').mockRejectedValue(new Error('Network error'))
    renderPage()

    expect(
      await screen.findByText("Couldn't load your wishlist. Please try again."),
    ).toBeInTheDocument()
    expect(screen.queryByText('Your wishlist is empty')).not.toBeInTheDocument()
  })
})
