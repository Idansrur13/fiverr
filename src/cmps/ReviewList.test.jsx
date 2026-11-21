import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ReviewList } from './ReviewList'

const reviews = Array.from({ length: 7 }, (_, idx) => ({
  id: `review-${idx + 1}`,
  rating: 5,
  by: { fullname: `Reviewer ${idx + 1}` },
  txt: `Review text ${idx + 1}`,
  createdAt: new Date(2026, 0, idx + 1).getTime(),
}))

describe('ReviewList', () => {
  it('renders the first 5 reviews', () => {
    render(<ReviewList reviews={reviews} />)

    expect(screen.getByText('Review text 1')).toBeInTheDocument()
    expect(screen.getByText('Review text 5')).toBeInTheDocument()
    expect(screen.queryByText('Review text 6')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Show more' })).toBeInTheDocument()
  })

  it('shows more reviews on Show more', () => {
    render(<ReviewList reviews={reviews} />)

    fireEvent.click(screen.getByRole('button', { name: 'Show more' }))

    expect(screen.getByText('Review text 6')).toBeInTheDocument()
    expect(screen.getByText('Review text 7')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Show more' })).not.toBeInTheDocument()
  })

  it('renders an empty state when there are no reviews', () => {
    render(<ReviewList reviews={[]} />)

    expect(screen.getByText('No reviews yet.')).toBeInTheDocument()
  })
})
