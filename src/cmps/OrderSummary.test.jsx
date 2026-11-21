import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { OrderSummary } from './OrderSummary'

describe('OrderSummary', () => {
  it('renders the gig title, price, service fee and total', () => {
    const gig = {
      title: 'Logo design',
      images: ['logo.jpg'],
    }

    render(<OrderSummary gig={gig} price={100} serviceFee={5.5} total={105.5} />)

    expect(screen.getByRole('heading', { name: 'Logo design' })).toBeInTheDocument()
    expect(screen.getByText('$100.00')).toBeInTheDocument()
    expect(screen.getByText('Service fee (5.5%)')).toBeInTheDocument()
    expect(screen.getByText('$5.50')).toBeInTheDocument()
    expect(screen.getByText('$105.50')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Logo design thumbnail' })).toHaveAttribute(
      'src',
      'logo.jpg',
    )
  })
})
