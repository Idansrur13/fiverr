import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { BudgetFilter } from './BudgetFilter'
import { store } from '../store/store'
import { setFilterBy } from '../store/gig.actions'
import { gigService } from '../services/gig.service'

function renderBudget(onClose = vi.fn()) {
  render(
    <Provider store={store}>
      <BudgetFilter onClose={onClose} />
    </Provider>,
  )
  return onClose
}

function getFilterBy() {
  return store.getState().gigModule.filterBy
}

describe('BudgetFilter', () => {
  beforeEach(() => {
    setFilterBy(gigService.getDefaultFilter())
  })

  it('applies min and max price to the filter', async () => {
    const user = userEvent.setup()
    const onClose = renderBudget()

    await user.type(screen.getByLabelText('Min.'), '50')
    await user.type(screen.getByLabelText('Max.'), '100')
    await user.click(screen.getByRole('button', { name: 'Apply' }))

    expect(getFilterBy()).toMatchObject({ minPrice: '50', maxPrice: '100' })
    expect(onClose).toHaveBeenCalled()
  })

  it('shows an error when min is greater than max', async () => {
    const user = userEvent.setup()
    const onClose = renderBudget()

    await user.type(screen.getByLabelText('Min.'), '200')
    await user.type(screen.getByLabelText('Max.'), '100')

    expect(screen.getByRole('alert')).toHaveTextContent("Min price can't be higher than max price")
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled()
    expect(getFilterBy()).toMatchObject({ minPrice: '', maxPrice: '' })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('clears the budget filter', async () => {
    const user = userEvent.setup()
    setFilterBy({ minPrice: '50', maxPrice: '100', category: 'music-audio' })
    const onClose = renderBudget()

    await user.click(screen.getByRole('button', { name: 'Clear all' }))

    expect(getFilterBy()).toMatchObject({ minPrice: '', maxPrice: '', category: 'music-audio' })
    expect(onClose).toHaveBeenCalled()
  })
})
