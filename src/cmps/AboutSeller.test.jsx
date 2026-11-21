import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AboutSeller } from './AboutSeller'
import gigs from '../data/gigs.json'

describe('AboutSeller', () => {
  const gig = gigs.find((item) => item.id === 'g101')
  const { owner, reviews } = gig
  const rating = reviews.reduce((total, review) => total + review.rating, 0) / reviews.length

  it('renders seller details with the average rating and review count', () => {
    render(
      <AboutSeller
        owner={{ ...owner, rating: undefined }}
        rating={rating}
        reviewsCount={reviews.length}
      />,
    )
    expect(screen.getByText(owner.fullname)).toBeTruthy()
    expect(screen.getByText('Top Rated Seller')).toBeTruthy()
    expect(screen.getByText('5.0')).toBeTruthy()
    expect(screen.getByText(`(${reviews.length})`)).toBeTruthy()
  })
})
