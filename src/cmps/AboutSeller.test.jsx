import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AboutSeller } from './AboutSeller'
import gigs from '../data/gigs.json'

describe('AboutSeller', () => {
  const { owner, reviews } = gigs.find((item) => item.id === 'g101')

  it('renders the seller name, level and rating', () => {
    render(<AboutSeller owner={owner} rating={owner.rating} reviewsCount={reviews.length} />)
    expect(screen.getByRole('heading', { name: owner.fullname })).toBeInTheDocument()
    expect(screen.getByText('Top Rated Seller')).toBeInTheDocument()
    expect(screen.getByText(owner.rating.toFixed(1))).toBeInTheDocument()
    expect(screen.getByText(`(${reviews.length})`)).toBeInTheDocument()
  })

  it('renders the seller details when they exist', () => {
    const seller = {
      ...owner,
      country: 'Israel',
      languages: ['Hebrew', 'English'],
      responseTime: '1 hour',
      about: 'Brand designer with ten years of experience.',
    }
    render(<AboutSeller owner={seller} rating={seller.rating} reviewsCount={reviews.length} />)

    expect(screen.getByText('Israel')).toBeInTheDocument()
    expect(screen.getByText('Hebrew, English')).toBeInTheDocument()
    expect(screen.getByText('1 hour')).toBeInTheDocument()
    expect(screen.getByText(seller.about)).toBeInTheDocument()
  })

  it('hides the details when the seller has none', () => {
    render(<AboutSeller owner={owner} rating={owner.rating} reviewsCount={reviews.length} />)
    expect(screen.queryByText('From')).not.toBeInTheDocument()
    expect(screen.queryByText('Languages')).not.toBeInTheDocument()
    expect(screen.queryByText('Avg. response time')).not.toBeInTheDocument()
  })
})
