import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SortBy } from './SortBy'
import { gigService } from '../services/gig.service'

function renderSortBy(filterChanges = {}) {
  const onSetFilter = vi.fn()
  render(
    <SortBy
      filterBy={{ ...gigService.getDefaultFilter(), ...filterChanges }}
      onSetFilter={onSetFilter}
    />,
  )
  return onSetFilter
}

describe('SortBy', () => {
  it('sets filterBy.sortBy on change', async () => {
    const user = userEvent.setup()
    const onSetFilter = renderSortBy()
    const select = screen.getByRole('combobox', { name: 'Sort by:' })

    expect(select).toHaveValue('recommended')

    await user.selectOptions(select, 'Newest arrivals')
    expect(onSetFilter).toHaveBeenLastCalledWith({ sortBy: 'newest' })

    await user.selectOptions(select, 'Best selling')
    expect(onSetFilter).toHaveBeenLastCalledWith({ sortBy: 'best-selling' })
  })

  it('sends recommended as an empty value, so it stays out of the url', async () => {
    const user = userEvent.setup()
    const onSetFilter = renderSortBy({ sortBy: 'newest' })
    const select = screen.getByRole('combobox', { name: 'Sort by:' })

    expect(select).toHaveValue('newest')
    await user.selectOptions(select, 'Recommended')
    expect(onSetFilter).toHaveBeenLastCalledWith({ sortBy: '' })
  })
})
