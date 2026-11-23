import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DeliveryFilter } from './DeliveryFilter'
import { gigService } from '../services/gig.service'

function renderDelivery(filterChanges = {}) {
  const onSetFilter = vi.fn()
  const onClose = vi.fn()
  render(
    <DeliveryFilter
      filterBy={{ ...gigService.getDefaultFilter(), ...filterChanges }}
      onSetFilter={onSetFilter}
      onClose={onClose}
    />,
  )
  return { onSetFilter, onClose }
}

describe('DeliveryFilter', () => {
  it('applies the selected delivery time', async () => {
    const user = userEvent.setup()
    const { onSetFilter, onClose } = renderDelivery()

    await user.click(screen.getByRole('radio', { name: 'Up to 3 days' }))
    await user.click(screen.getByRole('button', { name: 'Apply' }))

    expect(onSetFilter).toHaveBeenCalledWith({ daysToMake: '3' })
    expect(onClose).toHaveBeenCalled()
  })

  it('clears the delivery filter', async () => {
    const user = userEvent.setup()
    const { onSetFilter, onClose } = renderDelivery({ daysToMake: '7' })

    expect(screen.getByRole('radio', { name: 'Up to 7 days' })).toBeChecked()
    await user.click(screen.getByRole('button', { name: 'Clear' }))

    expect(onSetFilter).toHaveBeenCalledWith({ daysToMake: '' })
    expect(onClose).toHaveBeenCalled()
  })
})
