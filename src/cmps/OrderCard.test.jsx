import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { OrderCard } from './OrderCard'
import { addOrder } from '../store/order.actions'
import { store } from '../store/store'

vi.mock('../store/order.actions', () => ({
  addOrder: vi.fn(),
}))

const MOCK_GIG = {
  id: 'g101',
  title: 'Modern React Website',
  price: 120,
  daysToMake: 3,
  features: ['Functional website', 'Responsive design', 'Source code'],
  owner: { id: 'u101', fullname: 'Soli Dev', imgUrl: '' },
}

function renderOrderCard(gig = MOCK_GIG) {
  return render(
    <Provider store={store}>
      <OrderCard gig={gig} />
    </Provider>,
  )
}

describe('OrderCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders price, delivery time and included features', () => {
    renderOrderCard()
    expect(screen.getByText('$120')).toBeInTheDocument()
    expect(screen.getByText('3-day delivery')).toBeInTheDocument()
    expect(screen.getByText('Functional website')).toBeInTheDocument()
    expect(screen.getByText('Responsive design')).toBeInTheDocument()
    expect(screen.getByText('Source code')).toBeInTheDocument()
  })

  it('creates an order when Continue is clicked', async () => {
    addOrder.mockResolvedValue({ id: 'o101' })
    renderOrderCard()

    fireEvent.click(screen.getByRole('button', { name: /continue/i }))

    await waitFor(() => {
      expect(addOrder).toHaveBeenCalledTimes(1)
    })
  })

  it('disables the Continue button while creating an order', async () => {
    let resolveOrder
    addOrder.mockReturnValue(
      new Promise((resolve) => {
        resolveOrder = resolve
      }),
    )

    renderOrderCard()
    const continueBtn = screen.getByRole('button', { name: /continue/i })

    fireEvent.click(continueBtn)
    expect(continueBtn).toBeDisabled()

    resolveOrder({ id: 'o101' })
    await waitFor(() => {
      expect(continueBtn).not.toBeDisabled()
    })
  })

  it('shows a success message after the order is created', async () => {
    addOrder.mockResolvedValue({ id: 'o101' })
    renderOrderCard()

    fireEvent.click(screen.getByRole('button', { name: /continue/i }))

    expect(await screen.findByText(/order created successfully/i)).toBeInTheDocument()
  })

  it('shows an error message and re-enables the button on failure', async () => {
    addOrder.mockRejectedValue(new Error('Network error'))
    renderOrderCard()

    const continueBtn = screen.getByRole('button', { name: /continue/i })
    fireEvent.click(continueBtn)

    expect(await screen.findByText(/failed to create order/i)).toBeInTheDocument()
    expect(continueBtn).not.toBeDisabled()
  })
})