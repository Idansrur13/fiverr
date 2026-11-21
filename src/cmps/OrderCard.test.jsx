import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { OrderCard } from './OrderCard'
import { addOrder } from '../store/order.actions'
import { userService } from '../services/user.service'
import gigs from '../data/gigs.json'

vi.mock('../store/order.actions', () => ({
  addOrder: vi.fn(),
}))

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

function renderOrderCard(gig = gigWithPackages) {
  return render(
    <MemoryRouter initialEntries={[`/gig/${gig.id}`]}>
      <Routes>
        <Route path="/gig/:gigId" element={<OrderCard gig={gig} />} />
        <Route path="/orders" element={<h1>My Orders</h1>} />
      </Routes>
    </MemoryRouter>,
  )
}

function getContinueBtn() {
  return screen.getByRole('button', { name: /continue/i })
}

describe('OrderCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows the gig price and delivery time when the gig has no packages', () => {
    renderOrderCard(baseGig)
    expect(screen.getByText(`$${baseGig.price}`)).toBeInTheDocument()
    expect(screen.getByText(`${baseGig.daysToMake}-day delivery`)).toBeInTheDocument()
    expect(screen.queryByRole('group', { name: 'Packages' })).not.toBeInTheDocument()
  })

  it('shows the first package by default', () => {
    renderOrderCard()
    expect(screen.getByRole('button', { name: 'Basic' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('$40')).toBeInTheDocument()
    expect(screen.getByText('2-day delivery')).toBeInTheDocument()
    expect(screen.getByText('1 logo concept')).toBeInTheDocument()
  })

  it('switches price, delivery time and features when another package is selected', () => {
    renderOrderCard()
    fireEvent.click(screen.getByRole('button', { name: 'Premium' }))

    expect(screen.getByRole('button', { name: 'Premium' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('$150')).toBeInTheDocument()
    expect(screen.getByText('5-day delivery')).toBeInTheDocument()
    expect(screen.getByText('Brand guide')).toBeInTheDocument()
    expect(screen.queryByText('1 logo concept')).not.toBeInTheDocument()
  })

  it('orders the selected package for the logged in user and goes to the orders page', async () => {
    addOrder.mockResolvedValue({ id: 'o101' })
    renderOrderCard()

    fireEvent.click(screen.getByRole('button', { name: 'Standard' }))
    fireEvent.click(getContinueBtn())

    expect(await screen.findByRole('heading', { name: 'My Orders' })).toBeInTheDocument()
    expect(addOrder).toHaveBeenCalledTimes(1)
    expect(addOrder).toHaveBeenCalledWith({
      gig: gigWithPackages,
      buyer: userService.getLoggedinUser(),
      pkg: PACKAGES[1],
    })
  })

  it('creates only one order while the request is in progress', () => {
    addOrder.mockReturnValue(new Promise(() => {}))
    renderOrderCard()

    fireEvent.click(getContinueBtn())
    fireEvent.click(getContinueBtn())

    expect(getContinueBtn()).toBeDisabled()
    expect(addOrder).toHaveBeenCalledTimes(1)
  })

  it('shows an error and re-enables Continue when the order fails', async () => {
    addOrder.mockRejectedValue(new Error('Network error'))
    renderOrderCard()

    fireEvent.click(getContinueBtn())

    expect(await screen.findByRole('alert')).toHaveTextContent(/failed to create order/i)
    expect(getContinueBtn()).not.toBeDisabled()
  })

  it('clears the error when another package is selected', async () => {
    addOrder.mockRejectedValue(new Error('Network error'))
    renderOrderCard()

    fireEvent.click(getContinueBtn())
    await screen.findByRole('alert')
    fireEvent.click(screen.getByRole('button', { name: 'Premium' }))

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('does not let the seller order their own gig', () => {
    const ownGig = { ...gigWithPackages, owner: userService.getLoggedinUser() }
    renderOrderCard(ownGig)

    expect(screen.getByText(/can't order your own gig/i)).toBeInTheDocument()
    expect(getContinueBtn()).toBeDisabled()

    fireEvent.click(getContinueBtn())
    expect(addOrder).not.toHaveBeenCalled()
  })
})
