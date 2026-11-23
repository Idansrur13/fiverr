import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
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

function renderCheckout(packageId, search = '') {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/checkout/g101', search, state: { packageId } }]}>
      <Routes>
        <Route path="/checkout/:gigId" element={<CheckoutPage />} />
        <Route path="/orders/:orderId" element={<OrderDetailsPage />} />
        <Route path="/gig/:gigId" element={<h1>Gig details</h1>} />
      </Routes>
    </MemoryRouter>,
  )
}

async function pay() {
  fireEvent.change(await screen.findByLabelText('Cardholder name'), {
    target: { value: 'Demo Buyer' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Confirm & Pay' }))
}

async function getSummary() {
  return within(await screen.findByRole('region', { name: 'Order summary' }))
}

describe('CheckoutPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    gigService.getById.mockResolvedValue(gig)
    userService.getLoggedinUser.mockReturnValue(buyer)
    addOrder.mockResolvedValue({ id: 'order-123' })
  })

  it('loads the gig by the id in the url', async () => {
    renderCheckout()

    expect(await screen.findByRole('heading', { name: 'Logo design gig' })).toBeInTheDocument()
    expect(gigService.getById).toHaveBeenCalledWith('g101')
  })

  it('shows "Gig not found" when the gig does not exist', async () => {
    gigService.getById.mockRejectedValue(new Error('Cannot find g101 in gigDB'))
    renderCheckout()

    expect(await screen.findByRole('alert')).toHaveTextContent('Gig not found')
    expect(screen.queryByRole('button', { name: 'Confirm & Pay' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to gig' })).toHaveAttribute('href', '/gig/g101')
  })

  it('shows a load error when the gig cannot be loaded', async () => {
    gigService.getById.mockRejectedValue(new Error('Network error'))
    renderCheckout()

    expect(await screen.findByRole('alert')).toHaveTextContent(/failed to load gig/i)
    expect(screen.queryByRole('button', { name: 'Confirm & Pay' })).not.toBeInTheDocument()
  })

  it('orders the package that was chosen on the gig page', async () => {
    renderCheckout('premium')

    const summary = await getSummary()
    expect(summary.getByText('Premium')).toBeInTheDocument()
    expect(summary.getByText('5 days')).toBeInTheDocument()
    expect(summary.getByText('$250.00')).toBeInTheDocument()
    expect(summary.getByText('$13.75')).toBeInTheDocument()
    expect(summary.getByText('$263.75')).toBeInTheDocument()

    await pay()

    await waitFor(() => {
      expect(addOrder).toHaveBeenCalledWith({ gig, buyer, pkg: gig.packages[1] })
    })
  })

  it('orders the package from the url when it was not passed in the state', async () => {
    renderCheckout(undefined, '?package=PREMIUM')

    const summary = await getSummary()
    expect(summary.getByText('Premium')).toBeInTheDocument()

    await pay()

    await waitFor(() => {
      expect(addOrder).toHaveBeenCalledWith({ gig, buyer, pkg: gig.packages[1] })
    })
  })

  it('uses the first package when no known package was chosen', async () => {
    renderCheckout('removed-package')

    const summary = await getSummary()
    expect(summary.getByText('Basic')).toBeInTheDocument()
    expect(summary.getByText('$105.50')).toBeInTheDocument()

    await pay()

    await waitFor(() => {
      expect(addOrder).toHaveBeenCalledWith({ gig, buyer, pkg: gig.packages[0] })
    })
    expect(screen.queryByLabelText(/card number|expiration|cvv/i)).not.toBeInTheDocument()
  })

  it('orders the gig itself when it has no packages', async () => {
    const gigWithoutPackages = { ...gig, packages: undefined }
    gigService.getById.mockResolvedValue(gigWithoutPackages)
    renderCheckout()

    const summary = await getSummary()
    expect(summary.queryByText('Package')).not.toBeInTheDocument()
    expect(summary.getByText('3 days')).toBeInTheDocument()

    await pay()

    await waitFor(() => {
      expect(addOrder).toHaveBeenCalledWith({ gig: gigWithoutPackages, buyer, pkg: null })
    })
  })

  it('keeps the form and lets the buyer try again when the payment fails', async () => {
    addOrder.mockRejectedValueOnce(new Error('Network error'))
    renderCheckout()

    await pay()

    expect(await screen.findByRole('alert')).toHaveTextContent(/could not complete the order/i)
    expect(screen.getByLabelText('Cardholder name')).toHaveValue('Demo Buyer')
    const payBtn = screen.getByRole('button', { name: 'Confirm & Pay' })
    expect(payBtn).toBeEnabled()

    fireEvent.click(payBtn)

    expect(await screen.findByRole('heading', { name: 'Order confirmation' })).toBeInTheDocument()
    expect(addOrder).toHaveBeenCalledTimes(2)
  })

  it('creates only one order while the payment is in progress', async () => {
    addOrder.mockReturnValue(new Promise(() => {}))
    renderCheckout()

    await pay()
    fireEvent.click(screen.getByRole('button', { name: 'Processing...' }))

    expect(screen.getByRole('button', { name: 'Processing...' })).toBeDisabled()
    expect(addOrder).toHaveBeenCalledTimes(1)
  })

  it('does not let the seller order their own gig', async () => {
    userService.getLoggedinUser.mockReturnValue({ id: 'seller-1', fullname: 'Seller' })
    renderCheckout()

    expect(await screen.findByRole('alert')).toHaveTextContent('You cannot order your own gig.')
    expect(screen.getByRole('button', { name: 'Confirm & Pay' })).toBeDisabled()
  })

  it('navigates to the order confirmation after paying', async () => {
    renderCheckout()

    await pay()

    expect(await screen.findByRole('heading', { name: 'Order confirmation' })).toBeInTheDocument()
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Your order has been placed successfully.',
    )
    expect(screen.getByText('Order ID: order-123')).toBeInTheDocument()
  })

  it('navigates back to the gig', async () => {
    renderCheckout()

    fireEvent.click(await screen.findByRole('link', { name: 'Back to gig' }))

    expect(await screen.findByRole('heading', { name: 'Gig details' })).toBeInTheDocument()
  })
})
