import { StrictMode } from 'react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { SellerProfilePage } from './SellerProfilePage'
import { userService } from '../services/user.service'
import { store } from '../store/store'
import demoGigs from '../data/gigs.json'

const SELLER_ID = 'u101'
const sellerGigs = demoGigs.filter((gig) => gig.owner.id === SELLER_ID)
const seller = sellerGigs[0].owner

function renderProfile(userId = SELLER_ID) {
  render(
    <StrictMode>
      <Provider store={store}>
        <MemoryRouter initialEntries={[`/user/${userId}`]}>
          <Routes>
            <Route path="/user/:userId" element={<SellerProfilePage />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    </StrictMode>,
  )
}

describe('SellerProfilePage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the seller details', async () => {
    renderProfile()
    const sellerReviews = sellerGigs.flatMap((gig) => gig.reviews)
    const avgRating =
      sellerReviews.reduce((sum, review) => sum + review.rating, 0) / sellerReviews.length

    expect(
      await screen.findByRole('heading', { level: 1, name: seller.fullname }),
    ).toBeInTheDocument()
    const card = screen.getByRole('complementary')
    expect(within(card).getByText('Top Rated')).toBeInTheDocument()
    expect(within(card).getByText(avgRating.toFixed(1))).toBeInTheDocument()
    expect(within(card).getByText(`(${sellerReviews.length} reviews)`)).toBeInTheDocument()
    // The demo sellers have no country, languages or join date, so no empty details block
    expect(card.querySelector('.seller-profile-details')).toBeNull()
  })

  it('renders the seller details block when the seller has details', async () => {
    vi.spyOn(userService, 'getById').mockResolvedValue({
      ...seller,
      country: 'Israel',
      languages: ['Hebrew', 'English'],
      createdAt: '2024-03-10T00:00:00.000Z',
      about: 'Brand designer.',
      rating: 4.5,
      reviewsCount: 8,
      gigs: [],
    })
    renderProfile()

    expect(await screen.findByText('Israel')).toBeInTheDocument()
    expect(screen.getByText('Hebrew, English')).toBeInTheDocument()
    expect(screen.getByText('Mar 2024')).toBeInTheDocument()
    expect(screen.getByText('Brand designer.')).toBeInTheDocument()
    expect(screen.getByText(`${seller.fullname} has no active gigs right now.`)).toBeInTheDocument()
  })

  it('renders the seller gigs', async () => {
    renderProfile()
    const activeGigs = sellerGigs.filter((gig) => gig.status === 'ACTIVE')

    expect(
      await screen.findByRole('heading', { level: 2, name: `${seller.fullname}'s Gigs` }),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(activeGigs.length)
    activeGigs.forEach((gig) => {
      expect(screen.getByRole('heading', { name: gig.title })).toBeInTheDocument()
    })
    // Gigs of other sellers never show
    const otherGig = demoGigs.find((gig) => gig.owner.id !== SELLER_ID)
    expect(screen.queryByRole('heading', { name: otherGig.title })).not.toBeInTheDocument()
  })

  it('shows a not found message for an unknown user', async () => {
    renderProfile('no-such-user')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Seller not found' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('article')).not.toBeInTheDocument()
  })

  it('shows an error, not "not found", when loading fails', async () => {
    vi.spyOn(userService, 'getById').mockRejectedValue(new Error('Network error'))
    renderProfile()

    expect(
      await screen.findByText("Couldn't load this seller. Please try again."),
    ).toBeInTheDocument()
    expect(screen.queryByText('Seller not found')).not.toBeInTheDocument()
  })
})
