import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import gigs from '../data/gigs.json'
import { PackageSelector } from './PackageSelector'

const gig = gigs.find((item) => item.id === 'g101')
const packages = [
  { id: 'package-basic', tier: 'BASIC', title: 'Basic', price: 45, daysToMake: 2 },
  { id: 'package-premium', tier: 'PREMIUM', title: 'Premium', price: 90, daysToMake: 4 },
]

describe('PackageSelector', () => {
  it('switches selected package with accessible pressed state', () => {
    const onSelectionChange = vi.fn()

    render(
      <PackageSelector packages={packages} onSelectionChange={onSelectionChange}>
        {(selectedPackage) => (
          <p>
            {gig.title}: ${selectedPackage.price}
          </p>
        )}
      </PackageSelector>,
    )

    const basicButton = screen.getByRole('button', { name: 'Basic' })
    const premiumButton = screen.getByRole('button', { name: 'Premium' })

    expect(basicButton).toHaveAttribute('aria-pressed', 'true')
    expect(premiumButton).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByText(`${gig.title}: $45`)).toBeInTheDocument()

    fireEvent.click(premiumButton)

    expect(premiumButton).toHaveAttribute('aria-pressed', 'true')
    expect(basicButton).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByText(`${gig.title}: $90`)).toBeInTheDocument()
    expect(onSelectionChange).toHaveBeenCalledOnce()
  })

  it('falls back to the first package if the selected index no longer exists', () => {
    const { rerender } = render(
      <PackageSelector packages={packages}>
        {(selectedPackage) => <p>${selectedPackage.price}</p>}
      </PackageSelector>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Premium' }))

    rerender(
      <PackageSelector packages={[packages[0]]}>
        {(selectedPackage) => <p>${selectedPackage.price}</p>}
      </PackageSelector>,
    )

    expect(screen.getByText('$45')).toBeInTheDocument()
    rerender(
      <PackageSelector packages={packages}>
        {(selectedPackage) => <p>${selectedPackage.price}</p>}
      </PackageSelector>,
    )
    expect(screen.getByText('$45')).toBeInTheDocument()
  })
})
