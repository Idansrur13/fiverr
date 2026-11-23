import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import { OrderCard } from './OrderCard'
import { userService } from '../services/user.service'
import gigs from '../data/gigs.json'

const PACKAGES = [
  {
    id: 'p1',
    tier: 'BASIC',
    title: 'Basic',
    price: 40,
    daysToMake: 2,
    features: ['1 logo concept'],
  },
  {
    id: 'p2',
    tier: 'STANDARD',
    title: 'Standard',
    price: 90,
    daysToMake: 3,
    features: ['3 logo concepts', 'Source files'],
  },
  {
    id: 'p3',
    tier: 'PREMIUM',
    title: 'Premium',
    price: 150,
    daysToMake: 5,
    features: ['5 logo concepts', 'Source files', 'Brand guide'],
  },
]

const baseGig = gigs.find((gig) => gig.id === 'g101')
const gigWithPackages = { ...baseGig, packages: PACKAGES }

function CheckoutStub() {
  const { state, search } = useLocation()
  return (
    <>
      <h1>Checkout {state?.packageId}</h1>
      <p>{search}</p>
    </>
  )
}

function renderOrderCard(gig = gigWithPackages, path = `/gig/${gig.id}`) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/gig/:gigId" element={<OrderCard gig={gig} />} />
        <Route path="/checkout/:gigId" element={<CheckoutStub />} />
      </Routes>
    </MemoryRouter>,
  )
}

function getContinueBtn() {
  return screen.getByRole('button', { name: /continue/i })
}

describe('OrderCard', () => {
  it('shows the gig price and delivery time when the gig has no packages', () => {
    renderOrderCard(baseGig)
    expect(screen.getByText(`$${baseGig.price}`)).toBeInTheDocument()
    expect(screen.getByText(`${baseGig.daysToMake}-day delivery`)).toBeInTheDocument()
    expect(screen.queryByRole('tablist', { name: 'Packages' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    expect(screen.queryByText(/revision/)).not.toBeInTheDocument()
  })

  it('selects the package from the url', () => {
    renderOrderCard(gigWithPackages, `/gig/${gigWithPackages.id}?package=PREMIUM`)

    expect(screen.getByRole('tab', { name: 'Premium' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('$150')).toBeInTheDocument()
  })

  it('shows the first package by default', () => {
    renderOrderCard()
    expect(screen.getByRole('tab', { name: 'Basic' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('$40')).toBeInTheDocument()
    expect(screen.getByText('2-day delivery')).toBeInTheDocument()
    expect(screen.getByText('1 logo concept')).toBeInTheDocument()
  })

  it('switches price, delivery time and features when another package is selected', () => {
    renderOrderCard()
    fireEvent.click(screen.getByRole('tab', { name: 'Premium' }))

    expect(screen.getByRole('tab', { name: 'Premium' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('$150')).toBeInTheDocument()
    expect(screen.getByText('5-day delivery')).toBeInTheDocument()
    expect(screen.getByText('Brand guide')).toBeInTheDocument()
    expect(screen.queryByText('1 logo concept')).not.toBeInTheDocument()
  })

  it('sends the selected package id when ordering', () => {
    renderOrderCard()

    fireEvent.click(screen.getByRole('tab', { name: 'Standard' }))
    fireEvent.click(getContinueBtn())

    expect(screen.getByRole('heading', { name: 'Checkout p2' })).toBeInTheDocument()
    expect(screen.getByText('?package=STANDARD')).toBeInTheDocument()
  })

  it('does not let the seller order their own gig', () => {
    const ownGig = { ...gigWithPackages, owner: userService.getLoggedinUser() }
    renderOrderCard(ownGig)

    expect(screen.getByText(/can't order your own gig/i)).toBeInTheDocument()
    expect(getContinueBtn()).toBeDisabled()

    fireEvent.click(getContinueBtn())
    expect(screen.queryByRole('heading', { name: /checkout/i })).not.toBeInTheDocument()
  })
})
