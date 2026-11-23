import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { GigPreview } from './GigPreview'
import demoGigs from '../data/gigs.json'

const gig = demoGigs.find((demoGig) => demoGig.id === 'g101')

function renderPreview(gigToRender = gig) {
  render(
    <MemoryRouter>
      <GigPreview gig={gigToRender} />
    </MemoryRouter>,
  )
}

describe('GigPreview', () => {
  it('renders the gig title, seller name and starting price', () => {
    renderPreview()
    expect(screen.getByRole('heading', { name: gig.title })).toBeInTheDocument()
    expect(screen.getByText(gig.owner.fullname)).toBeInTheDocument()
    expect(screen.getByText(`From $${gig.price}`)).toBeInTheDocument()
    expect(screen.getByText('Top Rated')).toBeInTheDocument()
  })

  it('renders the rating and the reviews count', () => {
    // g103: the seller's rating is 4.6, but the gig's own 4 reviews average 4.25
    const gigWithMixedReviews = demoGigs.find((demoGig) => demoGig.id === 'g103')
    renderPreview(gigWithMixedReviews)

    expect(screen.getByText('4.3')).toBeInTheDocument()
    expect(screen.queryByText('4.6')).not.toBeInTheDocument()
    expect(screen.getByText('(4)')).toBeInTheDocument()
  })

  it('hides the rating when the gig has no reviews', () => {
    renderPreview({ ...gig, reviews: [] })
    expect(screen.queryByText(/\(\d+\)/)).not.toBeInTheDocument()
  })

  it('links to the gig details page', () => {
    renderPreview()
    const gigLinks = screen
      .getAllByRole('link')
      .filter((link) => !link.closest('.gig-preview-seller'))
    expect(gigLinks.length).toBeGreaterThan(0)
    gigLinks.forEach((link) => expect(link).toHaveAttribute('href', `/gig/${gig.id}`))
  })

  it('links the seller to their profile, outside the gig link', () => {
    renderPreview()
    const sellerLink = screen.getByRole('link', { name: gig.owner.fullname })

    expect(sellerLink).toHaveAttribute('href', `/user/${gig.owner.id}`)
    expect(sellerLink.parentElement.closest('a')).toBeNull()
    expect(sellerLink.querySelector('a')).toBeNull()
  })

  it('keeps the carousel buttons outside the links', () => {
    renderPreview()
    screen.getAllByRole('button').forEach((button) => {
      expect(button.closest('a')).toBeNull()
    })
  })
})
