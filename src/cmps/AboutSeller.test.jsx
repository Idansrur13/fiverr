import { render as rtlRender, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import { AboutSeller } from './AboutSeller'
import gigs from '../data/gigs.json'

// The seller's name is a link, so AboutSeller needs a router
function render(ui) {
  return rtlRender(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('AboutSeller', () => {
  const { owner, reviews } = gigs.find((item) => item.id === 'g101')

  it('renders the seller name, level and rating', () => {
    render(<AboutSeller owner={owner} rating={owner.rating} reviewsCount={reviews.length} />)
    expect(screen.getByRole('heading', { name: owner.fullname })).toBeInTheDocument()
    expect(screen.getByText('Top Rated')).toBeInTheDocument()
    expect(screen.getByText(owner.rating.toFixed(1))).toBeInTheDocument()
    expect(screen.getByText(`(${reviews.length} reviews)`)).toBeInTheDocument()
  })

  it('links the seller name to the seller profile', () => {
    render(<AboutSeller owner={owner} rating={owner.rating} reviewsCount={reviews.length} />)
    expect(screen.getByRole('link', { name: owner.fullname })).toHaveAttribute(
      'href',
      `/user/${owner.id}`,
    )
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
