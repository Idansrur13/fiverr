import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AboutSeller } from './AboutSeller'
import gigs from '../data/gigs.json'

describe('AboutSeller', () => {
  const gig = gigs.find((item) => item.id === 'g101')
  const { owner, reviews } = gig

  it('renders seller details from the gigs.json owner and reviews', () => {
    render(<AboutSeller owner={owner} rating={owner.rating} reviewsCount={reviews.length} />)
    expect(screen.getByText(owner.fullname)).toBeTruthy()
    expect(screen.getByText('Top Rated Seller')).toBeTruthy()
    expect(screen.getByText(owner.rating.toFixed(1))).toBeTruthy()
    expect(screen.getByText(`(${reviews.length})`)).toBeTruthy()
  })
})
