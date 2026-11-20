import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { GigFilter } from './GigFilter'
import { store } from '../store/store'
import { setFilterBy } from '../store/gig.actions'
import { gigService } from '../services/gig.service'

function renderFilter() {
  render(
    <Provider store={store}>
      <p>Outside the filter</p>
      <GigFilter />
    </Provider>,
  )
}

describe('GigFilter', () => {
  beforeEach(() => {
    setFilterBy(gigService.getDefaultFilter())
  })

  it('opens the budget panel on click', async () => {
    const user = userEvent.setup()
    renderFilter()

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Budget' }))

    expect(screen.getByRole('dialog', { name: 'Budget' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Budget' })).toHaveAttribute('aria-expanded', 'true')
  })

  it('closes the panel on outside click without applying', async () => {
    const user = userEvent.setup()
    renderFilter()

    await user.click(screen.getByRole('button', { name: 'Budget' }))
    await user.type(screen.getByLabelText('Min.'), '50')
    await user.click(screen.getByText('Outside the filter'))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(store.getState().gigModule.filterBy.minPrice).toBe('')
  })

  it('closes the panel on Escape', async () => {
    const user = userEvent.setup()
    renderFilter()

    await user.click(screen.getByRole('button', { name: 'Delivery time' }))
    expect(screen.getByRole('dialog', { name: 'Delivery time' })).toBeInTheDocument()

    await user.keyboard('{Escape}')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('marks a filter button as active when its filter is set', () => {
    setFilterBy({ maxPrice: '100' })
    renderFilter()

    expect(screen.getByRole('button', { name: 'Budget' })).toHaveClass('active')
    expect(screen.getByRole('button', { name: 'Delivery time' })).not.toHaveClass('active')
  })
})
