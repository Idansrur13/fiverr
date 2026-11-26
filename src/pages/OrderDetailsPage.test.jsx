import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { orderService } from '../services/order.service'
import { userService } from '../services/user.service'
import { OrderDetailsPage } from './OrderDetailsPage'

const user = { id: 'buyer-1', fullname: 'Buyer' }
const order = {
  id: 'order-123',
  buyer: user,
  buyerId: user.id,
  seller: { id: 'seller-1', fullname: 'Seller Name' },
  sellerId: 'seller-1',
  gig: { id: 'gig-1', title: 'Logo design', imgUrl: '/logo.jpg' },
  gigId: 'gig-1',
  package: { id: 'package-1', title: 'Standard', daysToMake: 5 },
  price: 120,
  serviceFee: 6.6,
  total: 126.6,
  quantity: 1,
  status: 'IN_PROGRESS',
  createdAt: '2026-11-20T12:00:00.000Z',
  dueAt: '2026-11-25T12:00:00.000Z',
}

function renderOrderDetails(path = '/orders/order-123') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/orders/:orderId" element={<OrderDetailsPage />} />
        <Route path="/gig/:gigId" element={<h1>Gig page</h1>} />
        <Route path="/orders" element={<h1>Orders page</h1>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('OrderDetailsPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(userService, 'getLoggedinUser').mockReturnValue(user)
    vi.spyOn(orderService, 'getById').mockResolvedValue(order)
  })

  it('loads the order by the id in the url', async () => {
    renderOrderDetails('/orders/order-123')

    expect(await screen.findByRole('heading', { name: 'Logo design' })).toBeInTheDocument()
    expect(orderService.getById).toHaveBeenCalledWith('order-123')
    expect(screen.getByText('Order #order-123')).toBeInTheDocument()
    expect(screen.getByText('Seller: Seller Name')).toBeInTheDocument()
    expect(screen.getByText('Nov 25, 2026')).toBeInTheDocument()
  })

  it('renders the price breakdown with service fee and total', async () => {
    renderOrderDetails()

    const table = await screen.findByRole('table')
    expect(within(table).getByRole('columnheader', { name: 'Item' })).toBeInTheDocument()
    expect(within(table).getByRole('columnheader', { name: 'Quantity' })).toBeInTheDocument()
    expect(within(table).getByRole('columnheader', { name: 'Days' })).toBeInTheDocument()
    expect(within(table).getByRole('columnheader', { name: 'Price' })).toBeInTheDocument()
    expect(within(table).getByRole('columnheader', { name: 'Service fee' })).toBeInTheDocument()
    expect(within(table).getByRole('columnheader', { name: 'Total' })).toBeInTheDocument()
    expect(within(table).getByText('$120.00')).toBeInTheDocument()
    expect(within(table).getByText('$6.60')).toBeInTheDocument()
    expect(within(table).getByText('$126.60')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Order again' })).toHaveAttribute('href', '/gig/gig-1')
  })

  it('shows a message when the order is not found', async () => {
    orderService.getById.mockRejectedValue(Object.assign(new Error('Not found'), { status: 404 }))
    renderOrderDetails()

    expect(await screen.findByRole('alert')).toHaveTextContent('Order not found')
  })

  it('shows a message when the order belongs to another user', async () => {
    orderService.getById.mockRejectedValue(
      Object.assign(new Error('Forbidden'), { status: 403, code: 'FORBIDDEN' }),
    )
    renderOrderDetails()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'You do not have permission to view this order',
    )
  })

  it('denies access when a returned order belongs to another user', async () => {
    orderService.getById.mockResolvedValue({
      ...order,
      buyer: { id: 'another-buyer' },
      buyerId: 'another-buyer',
      seller: { id: 'another-seller' },
      sellerId: 'another-seller',
    })
    renderOrderDetails()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'You do not have permission to view this order',
    )
  })
})
