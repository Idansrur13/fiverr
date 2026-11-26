import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { OrderTimeline } from './OrderTimeline'

describe('OrderTimeline', () => {
  it('marks the steps up to the current status as done', () => {
    render(<OrderTimeline status="DELIVERED" />)

    const timeline = screen.getByRole('region', { name: 'Track order' })
    const steps = within(timeline).getAllByRole('listitem')

    expect(steps).toHaveLength(4)
    expect(steps[0]).toHaveClass('is-done')
    expect(steps[1]).toHaveClass('is-done')
    expect(steps[2]).toHaveClass('is-done', 'is-current')
    expect(steps[2]).toHaveAttribute('aria-current', 'step')
    expect(steps[3]).not.toHaveClass('is-done')
  })

  it('shows only cancelled for a cancelled order', () => {
    render(<OrderTimeline status="CANCELLED" />)

    const timeline = screen.getByRole('region', { name: 'Track order' })
    expect(within(timeline).getAllByRole('listitem')).toHaveLength(1)
    expect(within(timeline).getByText('Cancelled')).toBeInTheDocument()
    expect(within(timeline).queryByText('Pending')).not.toBeInTheDocument()
  })
})
