import { StrictMode } from 'react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { SellerProfilePage } from './SellerProfilePage'
import { userService } from '../services/user.service'
import demoGigs from '../data/gigs.json'

const SELLER_ID = 'u101'
const sellerGigs = demoGigs.filter((gig) => gig.owner.id === SELLER_ID)
const seller = sellerGigs[0].owner

function renderProfile(userId = SELLER_ID) {
  render(
    <StrictMode>
      <MemoryRouter initialEntries={[`/user/${userId}`]}>
        <Routes>
          <Route path="/user/:userId" element={<SellerProfilePage />} />
        </Routes>
      </MemoryRouter>
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
