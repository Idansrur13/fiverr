import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GigFilter } from './GigFilter'
import { gigService } from '../services/gig.service'

function renderFilter(filterChanges = {}) {
  const onSetFilter = vi.fn()
  render(
    <>
      <p>Outside the filter</p>
      <GigFilter
        filterBy={{ ...gigService.getDefaultFilter(), ...filterChanges }}
        onSetFilter={onSetFilter}
      />
    </>,
  )
  return { onSetFilter }
}

function mockScreenWidth(isMobile) {
  vi.stubGlobal('matchMedia', (query) => ({ matches: isMobile, media: query }))
}

describe('GigFilter', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    document.body.style.overflow = ''
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
    const { onSetFilter } = renderFilter()

    await user.click(screen.getByRole('button', { name: 'Budget' }))
    await user.type(screen.getByLabelText('Min.'), '50')
    await user.click(screen.getByText('Outside the filter'))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(onSetFilter).not.toHaveBeenCalled()
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
    renderFilter({ maxPrice: '100' })

    expect(screen.getByRole('button', { name: 'Budget' })).toHaveClass('active')
    expect(screen.getByRole('button', { name: 'Delivery time' })).not.toHaveClass('active')
  })

  it('moves focus into the panel and back to its button on Escape', async () => {
    const user = userEvent.setup()
    renderFilter()

    await user.click(screen.getByRole('button', { name: 'Budget' }))
    expect(screen.getByLabelText('Min.')).toHaveFocus()

    await user.keyboard('{Escape}')
    expect(screen.getByRole('button', { name: 'Budget' })).toHaveFocus()
  })

  it('returns focus to its button after Apply', async () => {
    const user = userEvent.setup()
    const { onSetFilter } = renderFilter()

    await user.click(screen.getByRole('button', { name: 'Delivery time' }))
    await user.click(screen.getByRole('radio', { name: 'Up to 3 days' }))
    await user.click(screen.getByRole('button', { name: 'Apply' }))

    expect(onSetFilter).toHaveBeenCalledWith({ daysToMake: '3' })
    expect(screen.getByRole('button', { name: 'Delivery time' })).toHaveFocus()
  })

  it('locks the page scroll only on mobile while a panel is open', async () => {
    const user = userEvent.setup()
    mockScreenWidth(true)
    renderFilter()

    await user.click(screen.getByRole('button', { name: 'Budget' }))
    expect(document.body.style.overflow).toBe('hidden')

    await user.keyboard('{Escape}')
    expect(document.body.style.overflow).toBe('')
  })

  it('does not lock the page scroll on desktop', async () => {
    const user = userEvent.setup()
    mockScreenWidth(false)
    renderFilter()

    await user.click(screen.getByRole('button', { name: 'Budget' }))
    expect(document.body.style.overflow).toBe('')
  })
})
