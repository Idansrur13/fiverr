import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { orderService } from '../services/order.service'
import { userService } from '../services/user.service'
import { store } from '../store/store'
import { SET_ORDERS } from '../store/order.reducer'
import { BuyerOrdersPage } from './BuyerOrdersPage'

const buyer = { id: 'buyer-1', fullname: 'Buyer' }
const orders = [
  {
    id: 'pending-order',
    buyer,
    seller: { id: 'seller-1', fullname: 'Seller One' },
    gig: { id: 'gig-1', title: 'Pending gig', imgUrl: 'pending.jpg' },
    status: 'PENDING',
    createdAt: 1768003200000,
    dueAt: 1768262400000,
    price: 45,
    total: 47.48,
  },
  {
    id: 'progress-order',
    buyerId: buyer.id,
    seller: { id: 'seller-2', fullname: 'Seller Two' },
    gig: { id: 'gig-2', title: 'Progress gig', imgUrl: 'progress.jpg' },
    status: 'IN_PROGRESS',
    createdAt: 1767916800000,
    dueAt: 1768176000000,
    price: 60,
    total: 63.3,
  },
  {
    id: 'delivered-order',
    buyer,
    seller: { id: 'seller-3', fullname: 'Seller Three' },
    gig: { id: 'gig-3', title: 'Delivered gig', imgUrl: 'delivered.jpg' },
    status: 'DELIVERED',
    createdAt: 1767830400000,
    dueAt: 1768089600000,
    price: 70,
    total: 73.85,
  },
  {
    id: 'completed-order',
    buyer,
    seller: { id: 'seller-4', fullname: 'Seller Four' },
    gig: { id: 'gig-4', title: 'Completed gig', imgUrl: 'completed.jpg' },
    status: 'COMPLETED',
    createdAt: 1767744000000,
    dueAt: 1768003200000,
    price: 80,
    total: 84.4,
  },
  {
    id: 'other-buyer-order',
    buyer: { id: 'other-buyer' },
    seller: { id: 'seller-5', fullname: 'Other Seller' },
    gig: { id: 'gig-5', title: 'Other buyer gig', imgUrl: 'other.jpg' },
    status: 'PENDING',
    createdAt: 1767657600000,
    dueAt: 1767916800000,
    price: 90,
    total: 94.95,
  },
]

function renderBuyerOrdersPage() {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/orders']}>
        <Routes>
          <Route path="/orders" element={<BuyerOrdersPage />} />
          <Route path="/orders/:orderId" element={<h1>Order details route</h1>} />
          <Route path="/gig/:gigId" element={<h1>Gig route</h1>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  )
}

describe('BuyerOrdersPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
    store.dispatch({ type: SET_ORDERS, orders: [] })
    vi.spyOn(userService, 'getLoggedinUser').mockReturnValue(buyer)
    vi.spyOn(orderService, 'query').mockResolvedValue(
      orders.filter((order) => order.buyer?.id === buyer.id || order.buyerId === buyer.id),
    )
  })

  it('loads the orders of the logged in buyer', async () => {
    renderBuyerOrdersPage()

    expect(await screen.findByRole('row', { name: /Pending gig/ })).toBeInTheDocument()
    expect(orderService.query).toHaveBeenCalledWith({ buyerId: buyer.id })
    expect(screen.queryByRole('row', { name: /Other buyer gig/ })).not.toBeInTheDocument()
  })

  it('groups pending and in progress orders under Active', async () => {
    renderBuyerOrdersPage()

    expect(await screen.findByRole('row', { name: /Pending gig/ })).toBeInTheDocument()
    expect(screen.getByRole('row', { name: /Progress gig/ })).toBeInTheDocument()
    expect(screen.queryByRole('row', { name: /Delivered gig/ })).not.toBeInTheDocument()
  })

  it('filters orders by the selected tab', async () => {
    const user = userEvent.setup()
    renderBuyerOrdersPage()

    await user.click(await screen.findByRole('tab', { name: 'Delivered 1' }))

    expect(screen.getByRole('heading', { name: 'Delivered orders' })).toBeInTheDocument()
    expect(screen.getByRole('row', { name: /Delivered gig/ })).toBeInTheDocument()
    expect(screen.queryByRole('row', { name: /Pending gig/ })).not.toBeInTheDocument()
  })

  it('shows the count of orders in each tab', async () => {
    renderBuyerOrdersPage()

    await screen.findByRole('row', { name: /Pending gig/ })

    expect(screen.getByRole('tab', { name: 'Active 2' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Delivered 1' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Completed 1' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Cancelled 0' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'All 4' })).toBeInTheDocument()
  })

  it('navigates to the order details on row click', async () => {
    const user = userEvent.setup()
    renderBuyerOrdersPage()

    const row = await screen.findByRole('row', { name: /Pending gig/ })
    await user.click(row)

    expect(await screen.findByRole('heading', { name: 'Order details route' })).toBeInTheDocument()
  })

  it('renders an empty state for a tab without orders', async () => {
    const user = userEvent.setup()
    renderBuyerOrdersPage()

    await user.click(await screen.findByRole('tab', { name: 'Cancelled 0' }))

    expect(screen.getByText('No cancelled orders to show')).toBeInTheDocument()
  })

  it('links completed orders back to their gig', async () => {
    const user = userEvent.setup()
    renderBuyerOrdersPage()

    await user.click(await screen.findByRole('tab', { name: 'Completed 1' }))
    const orderRow = screen.getByRole('row', { name: /Completed gig/ })
    await user.click(within(orderRow).getByRole('link', { name: 'Order again' }))

    expect(await screen.findByRole('heading', { name: 'Gig route' })).toBeInTheDocument()
  })
})
