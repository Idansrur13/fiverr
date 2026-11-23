import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BudgetFilter } from './BudgetFilter'
import { gigService } from '../services/gig.service'

function renderBudget(filterChanges = {}) {
  const onSetFilter = vi.fn()
  const onClose = vi.fn()
  render(
    <BudgetFilter
      filterBy={{ ...gigService.getDefaultFilter(), ...filterChanges }}
      onSetFilter={onSetFilter}
      onClose={onClose}
    />,
  )
  return { onSetFilter, onClose }
}

describe('BudgetFilter', () => {
  it('applies min and max price to the filter', async () => {
    const user = userEvent.setup()
    const { onSetFilter, onClose } = renderBudget()

    await user.type(screen.getByLabelText('Min.'), '50')
    await user.type(screen.getByLabelText('Max.'), '100')
    await user.click(screen.getByRole('button', { name: 'Apply' }))

    expect(onSetFilter).toHaveBeenCalledWith({ minPrice: '50', maxPrice: '100' })
    expect(onClose).toHaveBeenCalled()
  })

  it('shows an error when min is greater than max', async () => {
    const user = userEvent.setup()
    const { onSetFilter, onClose } = renderBudget()

    await user.type(screen.getByLabelText('Min.'), '200')
    await user.type(screen.getByLabelText('Max.'), '100')
    await user.tab()

    expect(screen.getByRole('alert')).toHaveTextContent("Min price can't be higher than max price")
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Apply' }))
    expect(onSetFilter).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('does not show the error in the middle of typing', async () => {
    const user = userEvent.setup()
    renderBudget({ minPrice: '50' })

    // Typing "100" passes through "1" and "10", which are smaller than 50
    await user.type(screen.getByLabelText('Max.'), '1')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()

    await user.type(screen.getByLabelText('Max.'), '00')
    await user.tab()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('does not show the error while typing max after leaving min', async () => {
    const user = userEvent.setup()
    renderBudget()

    await user.type(screen.getByLabelText('Min.'), '50')
    await user.type(screen.getByLabelText('Max.'), '1')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()

    await user.type(screen.getByLabelText('Max.'), '00')
    await user.tab()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Apply' })).toBeEnabled()
  })

  it('clears the budget filter', async () => {
    const user = userEvent.setup()
    const { onSetFilter, onClose } = renderBudget({ minPrice: '50', maxPrice: '100' })

    expect(screen.getByLabelText('Min.')).toHaveValue(50)
    await user.click(screen.getByRole('button', { name: 'Clear' }))

    expect(onSetFilter).toHaveBeenCalledWith({ minPrice: '', maxPrice: '' })
    expect(onClose).toHaveBeenCalled()
  })
})
