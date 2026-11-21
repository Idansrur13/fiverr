import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { PackageSelector } from './PackageSelector'

const PACKAGES = [
  { id: 'p1', tier: 'BASIC', title: 'Basic' },
  { id: 'p2', tier: 'STANDARD', title: 'Standard' },
  { id: 'p3', tier: 'PREMIUM' },
]

describe('PackageSelector', () => {
  it('renders a button for every package and marks the selected one', () => {
    render(<PackageSelector packages={PACKAGES} selectedIdx={1} onSelect={() => {}} />)

    expect(screen.getByRole('group', { name: 'Packages' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Basic' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'Standard' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'PREMIUM' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('calls onSelect with the index of the clicked package', () => {
    const onSelect = vi.fn()
    render(<PackageSelector packages={PACKAGES} selectedIdx={0} onSelect={onSelect} />)

    fireEvent.click(screen.getByRole('button', { name: 'Standard' }))

    expect(onSelect).toHaveBeenCalledWith(1)
  })
})
