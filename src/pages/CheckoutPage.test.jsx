import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { gigService } from '../services/gig.service'
import { userService } from '../services/user.service'
import { addOrder } from '../store/order.actions'
import { CheckoutPage } from './CheckoutPage'

vi.mock('../services/gig.service', () => ({
  gigService: {
    getById: vi.fn(),
    getDefaultFilter: vi.fn(() => ({})),
  },
}))

vi.mock('../services/user.service', () => ({
  userService: {
    getLoggedinUser: vi.fn(),
  },
}))

vi.mock('../store/order.actions', () => ({
  addOrder: vi.fn(),
}))

const buyer = { id: 'buyer-1', fullname: 'Buyer', imgUrl: '' }
const gig = {
  id: 'gig-1',
  title: 'Gig title',
  images: ['gig.jpg'],
  owner: { id: 'seller-1', fullname: 'Seller' },
  packages: [
    { id: 'package-basic', tier: 'BASIC', title: 'Basic', price: 50, daysToMake: 2 },
    { id: 'package-premium', tier: 'PREMIUM', title: 'Premium', price: 250, daysToMake: 4 },
  ],
}

function renderCheckoutPage({ state, path = '/checkout/gig-1' } = {}) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: path, state }]}>
      <Routes>
        <Route path="/checkout/:gigId" element={<CheckoutPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('CheckoutPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    userService.getLoggedinUser.mockReturnValue(buyer)
    gigService.getById.mockResolvedValue(gig)
    addOrder.mockResolvedValue({ id: 'order-1' })
  })

  it('creates an order for the selected package with the service fee and total', async () => {
    renderCheckoutPage({
      state: {
        packageId: 'package-premium',
        selectedPackage: gig.packages[1],
      },
    })

    expect(await screen.findByText('Package: Premium')).toBeInTheDocument()
    expect(screen.getByText('Service fee (5%): $12.50')).toBeInTheDocument()
    expect(screen.getByText('Total: $262.50')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Place order' }))

    expect(await screen.findByRole('status')).toHaveTextContent(/order created/i)
    expect(addOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        buyer,
        packageId: 'package-premium',
        serviceFee: 12.5,
        total: 262.5,
        gig: expect.objectContaining({
          id: 'gig-1',
          price: 250,
          daysToMake: 4,
        }),
      }),
    )
  })

  it('blocks checkout when no user is logged in', async () => {
    userService.getLoggedinUser.mockReturnValue(null)
    renderCheckoutPage()

    expect(await screen.findByRole('button', { name: 'Place order' })).toBeDisabled()
    expect(screen.getByRole('alert')).toHaveTextContent(/log in/i)
  })

  it('blocks checkout for the gig owner', async () => {
    userService.getLoggedinUser.mockReturnValue({ ...buyer, id: 'seller-1' })
    renderCheckoutPage()

    expect(await screen.findByRole('button', { name: 'Place order' })).toBeDisabled()
    expect(screen.getByRole('alert')).toHaveTextContent(/cannot order your own gig/i)
  })

  it('does not create duplicate orders when Place order is clicked repeatedly', async () => {
    let resolveOrder
    addOrder.mockReturnValue(
      new Promise((resolve) => {
        resolveOrder = resolve
      }),
    )
    renderCheckoutPage()

    const placeOrderButton = await screen.findByRole('button', { name: 'Place order' })
    fireEvent.click(placeOrderButton)
    fireEvent.click(placeOrderButton)

    expect(addOrder).toHaveBeenCalledTimes(1)
    resolveOrder({ id: 'order-1' })
    expect(await screen.findByRole('status')).toHaveTextContent(/order created/i)
  })
})
