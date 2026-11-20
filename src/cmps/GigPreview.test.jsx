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
    renderPreview()
    expect(screen.getByText(gig.owner.rating.toFixed(1))).toBeInTheDocument()
    expect(screen.getByText(`(${gig.reviews.length})`)).toBeInTheDocument()
  })

  it('links to the gig details page', () => {
    renderPreview()
    expect(screen.getByRole('link')).toHaveAttribute('href', `/gig/${gig.id}`)
  })
})
