import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { OrderSummary } from './OrderSummary'

const gig = {
  title: 'Logo design',
  images: ['logo.jpg'],
  daysToMake: 3,
}

describe('OrderSummary', () => {
  it('renders the gig title, price, service fee and total', () => {
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

  it('shows the gig delivery time and no package when there is no package', () => {
    render(<OrderSummary gig={gig} price={100} serviceFee={5.5} total={105.5} />)

    expect(screen.queryByText('Package')).not.toBeInTheDocument()
    expect(screen.getByText('3 days')).toBeInTheDocument()
  })

  it('shows the selected package and its delivery time', () => {
    const pkg = { id: 'p3', tier: 'PREMIUM', title: 'Premium', price: 150, daysToMake: 1 }
    render(<OrderSummary gig={gig} pkg={pkg} price={150} serviceFee={8.25} total={158.25} />)

    expect(screen.getByText('Premium')).toBeInTheDocument()
    expect(screen.getByText('1 day')).toBeInTheDocument()
  })
})
