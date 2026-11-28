import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, act, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { OrdersDropdown } from './OrdersDropdown'
import { store } from '../store/store'
import { SET_BUYER_ORDERS } from '../store/order.reducer'
import { addOrder } from '../store/order.actions'
import { userService } from '../services/user.service'
import { orderService } from '../services/order.service'
import { httpService } from '../services/http.service'

const buyer = userService.getLoggedinUser()

const storedOrders = [
  {
    id: 'o1',
    buyer: { id: buyer.id },
    seller: { id: 'u101' },
    gig: { id: 'g101', title: 'I will design a modern minimalist logo', imgUrl: 'logo.jpg' },
    price: 50,
    total: 52.75,
    status: 'IN_PROGRESS',
    createdAt: 2,
  },
  {
    id: 'o2',
    buyer: { id: buyer.id },
    seller: { id: 'u102' },
    gig: { id: 'g105', title: 'I will build a responsive React website', imgUrl: 'web.jpg' },
    price: 450,
    total: 474.75,
    status: 'COMPLETED',
    createdAt: 1,
  },
  {
    id: 'o3',
    buyer: { id: 'someone-else' },
    seller: { id: buyer.id },
    gig: { id: 'g200', title: 'I will write your blog posts', imgUrl: 'blog.jpg' },
    price: 30,
    total: 31.65,
    status: 'PENDING',
    createdAt: 3,
  },
]

const gig = {
  id: 'g122',
  title: 'I will record a professional male voice over',
  price: 50,
  daysToMake: 1,
  images: ['voice.jpg'],
  owner: { id: 'u103', fullname: 'Sofia Martinez', imgUrl: 'sofia.jpg' },
}

function renderDropdown() {
  const user = userEvent.setup()
  render(
    <Provider store={store}>
      <MemoryRouter>
        <p>Outside</p>
        <OrdersDropdown />
      </MemoryRouter>
    </Provider>,
  )
  return user
}

function getPanel() {
  return screen.getByRole('region', { name: 'Your orders' })
}

describe('OrdersDropdown', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
    store.dispatch({ type: SET_BUYER_ORDERS, buyerOrders: [] })
  })

  it('opens the dropdown when Orders is clicked', async () => {
    const user = renderDropdown()
    const ordersBtn = screen.getByRole('button', { name: 'Orders' })
    expect(ordersBtn).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('region', { name: 'Your orders' })).not.toBeInTheDocument()

    await user.click(ordersBtn)

    expect(ordersBtn).toHaveAttribute('aria-expanded', 'true')
    expect(getPanel()).toBeInTheDocument()
    expect(within(getPanel()).getByRole('link', { name: 'View all orders' })).toHaveAttribute(
      'href',
      '/orders',
    )
  })

  it('renders the buyer orders with title, price and status', async () => {
    vi.spyOn(orderService, 'query').mockResolvedValue(storedOrders.slice(0, 2))
    const user = renderDropdown()

    await user.click(screen.getByRole('button', { name: 'Orders' }))

    const logoOrder = await screen.findByRole('link', { name: /modern minimalist logo/ })
    expect(logoOrder).toHaveAttribute('href', '/orders/o1')
    expect(within(logoOrder).getByText('$52.75')).toBeInTheDocument()
    expect(within(logoOrder).getByText('In progress')).toHaveAttribute('data-status', 'IN_PROGRESS')

    const websiteOrder = screen.getByRole('link', { name: /responsive React website/ })
    expect(within(websiteOrder).getByText('$474.75')).toBeInTheDocument()
    expect(within(websiteOrder).getByText('Completed')).toHaveAttribute('data-status', 'COMPLETED')

    expect(screen.queryByText('I will write your blog posts')).not.toBeInTheDocument()
  })

  it('renders an empty state when there are no orders', async () => {
    vi.spyOn(orderService, 'query').mockResolvedValue([])
    const user = renderDropdown()

    await user.click(screen.getByRole('button', { name: 'Orders' }))

    expect(await within(getPanel()).findByText('No orders yet')).toBeInTheDocument()
  })

  it('closes on outside click', async () => {
    vi.spyOn(orderService, 'query').mockResolvedValue([])
    const user = renderDropdown()
    await user.click(screen.getByRole('button', { name: 'Orders' }))
    await within(getPanel()).findByText('No orders yet')

    await user.click(within(getPanel()).getByText('No orders yet'))
    expect(getPanel()).toBeInTheDocument()

    await user.click(screen.getByText('Outside'))
    expect(screen.queryByRole('region', { name: 'Your orders' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Orders' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('shows a new order added to the store', async () => {
    vi.spyOn(orderService, 'query').mockResolvedValue([])
    const newOrder = {
      id: 'new-order',
      buyer: { id: buyer.id, fullname: buyer.fullname },
      seller: { id: gig.owner.id, fullname: gig.owner.fullname },
      gig: { id: gig.id, title: gig.title, imgUrl: gig.images[0] },
      package: null,
      price: 50,
      serviceFee: 2.75,
      total: 52.75,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    }
    vi.spyOn(httpService, 'post').mockResolvedValue(newOrder)
    const user = renderDropdown()
    await user.click(screen.getByRole('button', { name: 'Orders' }))
    await within(getPanel()).findByText('No orders yet')

    await act(() => addOrder({ gig, buyer }))

    const newOrderLink = screen.getByRole('link', { name: /professional male voice over/ })
    expect(within(newOrderLink).getByText('Pending')).toBeInTheDocument()
    expect(screen.queryByText('No orders yet')).not.toBeInTheDocument()
  })
})
