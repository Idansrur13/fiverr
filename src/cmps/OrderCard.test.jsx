import { fireEvent, render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { userService } from '../services/user.service'
import { store } from '../store/store'
import gigs from '../data/gigs.json'
import { OrderCard } from './OrderCard'

vi.mock('../services/user.service', () => ({
  userService: {
    getLoggedinUser: vi.fn(),
  },
}))

const buyer = { id: 'buyer-1', fullname: 'Buyer', imgUrl: '' }
const baseGig = gigs.find((item) => item.id === 'g101')
const gig = {
  ...baseGig,
  packages: [
    {
      id: 'package-basic',
      tier: 'BASIC',
      title: 'Basic',
      price: 50,
      daysToMake: 2,
      description: 'A clean starter package.',
      features: ['One design concept'],
    },
    {
      id: 'package-standard',
      tier: 'STANDARD',
      title: 'Standard',
      price: 150,
      daysToMake: 3,
      description: 'A polished package for growing brands.',
      features: ['Three design concepts'],
    },
    {
      id: 'package-premium',
      tier: 'PREMIUM',
      title: 'Premium',
      price: 250,
      daysToMake: 4,
      description: 'A complete, premium design package.',
      features: ['Five design concepts'],
    },
  ],
}

function LocationState() {
  const location = useLocation()
  return (
    <output data-testid="location-state">
      {JSON.stringify({ pathname: location.pathname, state: location.state })}
    </output>
  )
}

function renderOrderCard(currentGig = gig) {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[`/gig/${currentGig.id}`]}>
        <Routes>
          <Route
            path="/gig/:gigId"
            element={
              <>
                <OrderCard gig={currentGig} />
                <LocationState />
              </>
            }
          />
          <Route path="/checkout/:gigId" element={<LocationState />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  )
}

describe('OrderCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    userService.getLoggedinUser.mockReturnValue(buyer)
  })

  it('renders the selected package price and delivery time', () => {
    renderOrderCard()
    expect(screen.getByRole('heading', { name: 'Basic' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Package selection' }).children).toHaveLength(3)
    expect(screen.getByRole('img', { name: 'Pricing information' })).toBeInTheDocument()
    expect(screen.getByText('$50')).toBeInTheDocument()
    expect(screen.getByText('Includes taxes and service fees')).toBeInTheDocument()
    expect(screen.getByText('A clean starter package.')).toBeInTheDocument()
    expect(screen.getByText('2-day delivery')).toBeInTheDocument()
    expect(screen.getByText('One design concept')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
  })

  it('switches the full package details when another tier is selected', () => {
    renderOrderCard()
    fireEvent.click(screen.getByRole('button', { name: 'Premium' }))

    expect(screen.getByRole('heading', { name: 'Premium' })).toBeInTheDocument()
    expect(screen.getByText('$250')).toBeInTheDocument()
    expect(screen.getByText('A complete, premium design package.')).toBeInTheDocument()
    expect(screen.getByText('4-day delivery')).toBeInTheDocument()
    expect(screen.getByText('Five design concepts')).toBeInTheDocument()
  })

  it('navigates to checkout with the selected package', () => {
    renderOrderCard()
    fireEvent.click(screen.getByRole('button', { name: 'Premium' }))
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))

    const navigation = JSON.parse(screen.getByTestId('location-state').textContent)
    expect(navigation.pathname).toBe(`/checkout/${gig.id}`)
    expect(navigation.state.packageId).toBe('package-premium')
    expect(navigation.state.selectedPackage).toMatchObject({
      tier: 'PREMIUM',
      price: 250,
      daysToMake: 4,
    })
  })

  it('blocks ordering when there is no logged-in user', () => {
    userService.getLoggedinUser.mockReturnValue(null)
    renderOrderCard()

    expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled()
    expect(screen.getByRole('alert')).toHaveTextContent(/log in/i)
  })

  it('blocks ordering the logged-in seller own gig', () => {
    userService.getLoggedinUser.mockReturnValue({ ...buyer, id: gig.owner.id })
    renderOrderCard()

    expect(screen.getByRole('button', { name: /your gig/i })).toBeDisabled()
    expect(screen.getByRole('alert')).toHaveTextContent(/cannot order your own gig/i)
  })

  it('resets the package selection when the gig changes', () => {
    const { rerender } = renderOrderCard()
    fireEvent.click(screen.getByRole('button', { name: 'Premium' }))
    expect(screen.getByText('$250')).toBeInTheDocument()

    const nextGig = {
      ...gig,
      id: 'g102',
      packages: [
        { id: 'package-new', title: 'New package', price: 25, daysToMake: 1 },
        { id: 'package-newer', title: 'Another package', price: 30, daysToMake: 2 },
      ],
    }

    rerender(
      <Provider store={store}>
        <MemoryRouter initialEntries={[`/gig/${nextGig.id}`]}>
          <Routes>
            <Route
              path="/gig/:gigId"
              element={
                <>
                  <OrderCard gig={nextGig} />
                  <LocationState />
                </>
              }
            />
            <Route path="/checkout/:gigId" element={<LocationState />} />
          </Routes>
        </MemoryRouter>
      </Provider>,
    )

    expect(screen.getByText('$25')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'New Package' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('resets the package selection when the package list shrinks', () => {
    const { rerender } = renderOrderCard()
    fireEvent.click(screen.getByRole('button', { name: 'Premium' }))
    expect(screen.getByText('$250')).toBeInTheDocument()

    const renderUpdatedGig = (updatedGig) =>
      rerender(
        <Provider store={store}>
          <MemoryRouter initialEntries={[`/gig/${updatedGig.id}`]}>
            <Routes>
              <Route
                path="/gig/:gigId"
                element={
                  <>
                    <OrderCard gig={updatedGig} />
                    <LocationState />
                  </>
                }
              />
              <Route path="/checkout/:gigId" element={<LocationState />} />
            </Routes>
          </MemoryRouter>
        </Provider>,
      )

    renderUpdatedGig({ ...gig, packages: [gig.packages[0]] })
    expect(screen.getByText('$50')).toBeInTheDocument()
    renderUpdatedGig(gig)

    expect(screen.getByText('$50')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Basic' })).toHaveAttribute('aria-pressed', 'true')
  })
})
