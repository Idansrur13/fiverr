import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { PackageSelector } from './PackageSelector'

const PACKAGES = [
  {
    id: 'p1',
    tier: 'BASIC',
    title: 'Basic',
    description: 'A simple logo package',
    price: 40,
    daysToMake: 2,
    revisions: 1,
    features: ['1 logo concept'],
  },
  {
    id: 'p2',
    tier: 'STANDARD',
    title: 'Standard',
    description: 'A complete logo package',
    price: 90,
    daysToMake: 3,
    revisions: 3,
    features: ['3 logo concepts'],
  },
  {
    id: 'p3',
    tier: 'PREMIUM',
    title: 'Premium',
    description: 'A premium logo package',
    price: 150,
    daysToMake: 5,
    revisions: 5,
    features: ['5 logo concepts'],
  },
]

describe('PackageSelector', () => {
  it('renders a tab for each package', () => {
    render(<PackageSelector packages={PACKAGES} selectedIdx={1} onSelect={() => {}} />)

    expect(screen.getByRole('tablist', { name: 'Packages' })).toBeInTheDocument()
    expect(screen.getAllByRole('tab')).toHaveLength(3)
    expect(screen.getByRole('tab', { name: 'Basic' })).toHaveAttribute('aria-selected', 'false')
    expect(screen.getByRole('tab', { name: 'Standard' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Premium' })).toHaveAttribute('aria-selected', 'false')
  })

  it('shows the details of the selected package', () => {
    render(<PackageSelector packages={PACKAGES} selectedIdx={1} onSelect={() => {}} />)

    expect(screen.getByRole('heading', { name: 'Standard' })).toBeInTheDocument()
    expect(screen.getByText('A complete logo package')).toBeInTheDocument()
    expect(screen.getByText('$90')).toBeInTheDocument()
    expect(screen.getByText('3-day delivery')).toBeInTheDocument()
    expect(screen.getByText('3 revisions')).toBeInTheDocument()
    expect(screen.getByText('3 logo concepts')).toBeInTheDocument()
  })

  it('switches package on tab click', () => {
    const onSelect = vi.fn()
    render(<PackageSelector packages={PACKAGES} selectedIdx={0} onSelect={onSelect} />)

    fireEvent.click(screen.getByRole('tab', { name: 'Standard' }))

    expect(onSelect).toHaveBeenCalledWith(1)
  })

  it('moves between tabs with the arrow keys', () => {
    const onSelect = vi.fn()
    render(<PackageSelector packages={PACKAGES} selectedIdx={0} onSelect={onSelect} />)

    fireEvent.keyDown(screen.getByRole('tab', { name: 'Basic' }), { key: 'ArrowRight' })
    expect(onSelect).toHaveBeenCalledWith(1)

    fireEvent.keyDown(screen.getByRole('tab', { name: 'Basic' }), { key: 'End' })
    expect(onSelect).toHaveBeenLastCalledWith(2)
  })

  it('hides the tabs for a single package', () => {
    render(<PackageSelector packages={[PACKAGES[0]]} selectedIdx={0} onSelect={() => {}} />)

    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
    expect(screen.queryAllByRole('tab')).toHaveLength(0)
    expect(screen.getByRole('heading', { name: 'Basic' })).toBeInTheDocument()
  })
})
