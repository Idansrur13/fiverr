import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { gigService } from '../services/gig.service'
import { userService } from '../services/user.service'
import { addOrder } from '../store/order.actions'
import { CheckoutPage } from './CheckoutPage'
import { OrderDetailsPage } from './OrderDetailsPage'

vi.mock('../services/gig.service', () => ({
  gigService: {
    getById: vi.fn(),
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

const gig = {
  id: 'g101',
  title: 'Logo design gig',
  price: 100,
  daysToMake: 3,
  images: ['logo.jpg'],
  owner: { id: 'seller-1', fullname: 'Seller' },
  packages: [
    { id: 'basic', tier: 'BASIC', title: 'Basic', price: 100, daysToMake: 3 },
    { id: 'premium', tier: 'PREMIUM', title: 'Premium', price: 250, daysToMake: 5 },
  ],
}
const buyer = { id: 'buyer-1', fullname: 'Buyer' }

function renderCheckout(initialEntry = '/checkout/g101') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/checkout/:gigId" element={<CheckoutPage />} />
        <Route path="/orders/:orderId" element={<OrderDetailsPage />} />
        <Route path="/gig/:gigId" element={<h1>Gig details</h1>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('CheckoutPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    gigService.getById.mockResolvedValue(gig)
    userService.getLoggedinUser.mockReturnValue(buyer)
    addOrder.mockResolvedValue({ id: 'order-123' })
  })

  it('loads the gig by the id in the url', async () => {
    renderCheckout('/checkout/g101')

    expect(await screen.findByRole('heading', { name: 'Logo design gig' })).toBeInTheDocument()
    expect(gigService.getById).toHaveBeenCalledWith('g101')
  })

  it('uses the bundled demo gig if the gig service is unavailable', async () => {
    gigService.getById.mockRejectedValue(new Error('Data layer unavailable'))

    renderCheckout('/checkout/g101')

    expect(
      await screen.findByRole('heading', { name: /design a modern minimalist logo/i }),
    ).toBeInTheDocument()
  })

  it('creates the order on Confirm & Pay', async () => {
    renderCheckout('/checkout/g101')

    fireEvent.change(await screen.findByLabelText('Cardholder name'), {
      target: { value: 'Demo Buyer' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Confirm & Pay' }))

    await waitFor(() => {
      expect(addOrder).toHaveBeenCalledWith({
        gig: expect.objectContaining({ id: 'g101', price: 100, daysToMake: 3 }),
        buyer,
        pkg: gig.packages[0],
        serviceFee: 5.5,
        total: 105.5,
      })
    })
    expect(screen.queryByLabelText(/card number|expiration|cvv/i)).not.toBeInTheDocument()
  })

  it('navigates to the order confirmation after paying', async () => {
    renderCheckout('/checkout/g101')

    fireEvent.change(await screen.findByLabelText('Cardholder name'), {
      target: { value: 'Demo Buyer' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Confirm & Pay' }))

    expect(await screen.findByRole('heading', { name: 'Order confirmation' })).toBeInTheDocument()
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Your order has been placed successfully.',
    )
    expect(screen.getByText('Order ID: order-123')).toBeInTheDocument()
  })

  it('navigates back to the gig', async () => {
    renderCheckout('/checkout/g101')

    fireEvent.click(await screen.findByRole('link', { name: 'Back to gig' }))

    expect(await screen.findByRole('heading', { name: 'Gig details' })).toBeInTheDocument()
  })
})
