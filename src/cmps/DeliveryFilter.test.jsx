import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { DeliveryFilter } from './DeliveryFilter'
import { store } from '../store/store'
import { setFilterBy } from '../store/gig.actions'
import { gigService } from '../services/gig.service'

function renderDelivery(onClose = vi.fn()) {
  render(
    <Provider store={store}>
      <DeliveryFilter onClose={onClose} />
    </Provider>,
  )
  return onClose
}

function getFilterBy() {
  return store.getState().gigModule.filterBy
}

describe('DeliveryFilter', () => {
  beforeEach(() => {
    setFilterBy(gigService.getDefaultFilter())
  })

  it('applies the selected delivery time', async () => {
    const user = userEvent.setup()
    const onClose = renderDelivery()

    await user.click(screen.getByRole('radio', { name: 'Up to 3 days' }))
    await user.click(screen.getByRole('button', { name: 'Apply' }))

    expect(getFilterBy().daysToMake).toBe('3')
    expect(onClose).toHaveBeenCalled()
  })

  it('clears the delivery filter', async () => {
    const user = userEvent.setup()
    setFilterBy({ daysToMake: '7', txt: 'logo' })
    const onClose = renderDelivery()

    expect(screen.getByRole('radio', { name: 'Up to 7 days' })).toBeChecked()
    await user.click(screen.getByRole('button', { name: 'Clear all' }))

    expect(getFilterBy()).toMatchObject({ daysToMake: '', txt: 'logo' })
    expect(onClose).toHaveBeenCalled()
  })
})
