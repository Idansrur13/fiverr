import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ReviewStats } from './ReviewStats'

const reviews = [{ rating: 5 }, { rating: 5 }, { rating: 4 }, { rating: 3 }]

describe('ReviewStats', () => {
  it('renders the average and the total count', () => {
    render(<ReviewStats reviews={reviews} />)

    expect(screen.getByText('4.3')).toBeInTheDocument()
    expect(screen.getByText('4 reviews')).toBeInTheDocument()
  })

  it('renders a bar for each rating', () => {
    render(<ReviewStats reviews={reviews} />)

    const bars = screen.getAllByRole('progressbar')
    expect(bars).toHaveLength(5)
    expect(bars[0].firstElementChild).toHaveStyle({ width: '50%' })
    expect(bars[4]).toHaveAttribute('aria-valuenow', '0')
  })
})
