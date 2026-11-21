import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { userService } from '../services/user.service'
import { OrderCard } from './OrderCard'

vi.mock('../services/user.service', () => ({
  userService: {
    getLoggedinUser: vi.fn(),
  },
}))

const buyer = { id: 'buyer-1', fullname: 'Buyer' }
const gig = {
  id: 'g101',
  title: 'Logo design gig',
  price: 80,
  daysToMake: 3,
  owner: { id: 'seller-1' },
  packages: [
    { id: 'basic', tier: 'BASIC', title: 'Basic', price: 80, daysToMake: 3 },
    { id: 'premium', tier: 'PREMIUM', title: 'Premium', price: 200, daysToMake: 5 },
  ],
}

function CheckoutLocation() {
  const location = useLocation()
  return <output data-testid="checkout-location">{JSON.stringify(location.state)}</output>
}

describe('OrderCard', () => {
  beforeEach(() => {
    userService.getLoggedinUser.mockReturnValue(buyer)
  })

  it('navigates to checkout with the selected package', () => {
    render(
      <MemoryRouter initialEntries={['/gig/g101']}>
        <Routes>
          <Route path="/gig/:gigId" element={<OrderCard gig={gig} />} />
          <Route
            path="/checkout/:gigId"
            element={
              <>
                <h1>Checkout</h1>
                <CheckoutLocation />
              </>
            }
          />
        </Routes>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Premium' }))
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))

    expect(screen.getByRole('heading', { name: 'Checkout' })).toBeInTheDocument()
    expect(screen.getByTestId('checkout-location')).toHaveTextContent(
      JSON.stringify({
        packageId: 'premium',
        selectedPackage: gig.packages[1],
      }),
    )
  })

  it('prevents the seller from ordering their own gig', () => {
    userService.getLoggedinUser.mockReturnValue({ ...buyer, id: 'seller-1' })
    render(
      <MemoryRouter>
        <OrderCard gig={gig} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled()
  })
})
