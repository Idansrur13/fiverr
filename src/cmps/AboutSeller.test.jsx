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
  const sellerWithProfile = {
    ...owner,
    country: 'Israel',
    createdAt: '2020-03-15T00:00:00.000Z',
    languages: ['Hebrew', 'English'],
    responseTime: '1 hour',
    lastDelivery: '2024-01-02T00:00:00.000Z',
    about: 'Brand designer with ten years of experience.',
  }

  it('renders the seller name, level and rating', () => {
    render(<AboutSeller owner={owner} rating={owner.rating} reviewsCount={reviews.length} />)
    expect(screen.getByRole('heading', { name: owner.fullname })).toBeInTheDocument()
    expect(screen.getByText('Top Rated')).toBeInTheDocument()
    expect(screen.getByText(owner.rating.toFixed(1))).toBeInTheDocument()
    expect(screen.getByText(`(${reviews.length})`)).toBeInTheDocument()
    expect(screen.getByRole('img', { name: owner.fullname })).toBeInTheDocument()
  })

  it('links the seller name to the seller profile', () => {
    render(<AboutSeller owner={owner} rating={owner.rating} reviewsCount={reviews.length} />)
    expect(screen.getByRole('link', { name: owner.fullname })).toHaveAttribute(
      'href',
      `/user/${owner.id}`,
    )
  })

  it('renders the seller details when they exist', () => {
    render(
      <AboutSeller
        owner={sellerWithProfile}
        rating={sellerWithProfile.rating}
        reviewsCount={reviews.length}
      />,
    )

    expect(screen.getByText('Israel')).toBeInTheDocument()
    expect(screen.getByText('March 2020')).toBeInTheDocument()
    expect(screen.getByText('Hebrew, English')).toBeInTheDocument()
    expect(screen.getByText('1 hour')).toBeInTheDocument()
    expect(screen.getByText('January 2, 2024')).toBeInTheDocument()
    expect(screen.getByText(sellerWithProfile.about)).toBeInTheDocument()
  })

  it('hides the details when the seller has none', () => {
    render(<AboutSeller owner={owner} rating={owner.rating} reviewsCount={reviews.length} />)
    expect(screen.queryByText('From')).not.toBeInTheDocument()
    expect(screen.queryByText('Languages')).not.toBeInTheDocument()
    expect(screen.queryByText('Avg. response time')).not.toBeInTheDocument()
  })

  it('renders the country, member since and languages', () => {
    render(
      <AboutSeller
        owner={sellerWithProfile}
        rating={sellerWithProfile.rating}
        reviewsCount={reviews.length}
      />,
    )

    expect(screen.getByText('From')).toBeInTheDocument()
    expect(screen.getByText('Israel')).toBeInTheDocument()
    expect(screen.getByText('Member since')).toBeInTheDocument()
    expect(screen.getByText('March 2020')).toBeInTheDocument()
    expect(screen.getByText('Languages')).toBeInTheDocument()
    expect(screen.getByText('Hebrew, English')).toBeInTheDocument()
  })

  it('renders the about text', () => {
    render(
      <AboutSeller
        owner={sellerWithProfile}
        rating={sellerWithProfile.rating}
        reviewsCount={reviews.length}
      />,
    )

    expect(screen.getByText(sellerWithProfile.about)).toBeInTheDocument()
  })

  it('renders the Contact me button', () => {
    render(<AboutSeller owner={owner} rating={owner.rating} reviewsCount={reviews.length} />)

    expect(screen.getByRole('button', { name: 'Contact me' })).toBeInTheDocument()
  })

  it('ignores malformed optional profile values', () => {
    const incompleteSeller = {
      ...owner,
      country: '  ',
      createdAt: 'not-a-date',
      languages: ['Hebrew', '', null, { invalid: true }],
      responseTime: null,
      lastDelivery: 'invalid',
      about: '  ',
    }

    render(<AboutSeller owner={incompleteSeller} rating={owner.rating} />)

    expect(screen.getByText('Hebrew')).toBeInTheDocument()
    expect(screen.queryByText('From')).not.toBeInTheDocument()
    expect(screen.queryByText('Member since')).not.toBeInTheDocument()
    expect(screen.queryByText('Avg. response time')).not.toBeInTheDocument()
    expect(screen.queryByText('Last delivery')).not.toBeInTheDocument()
    expect(screen.queryByText('Languages')).toBeInTheDocument()
  })
})
