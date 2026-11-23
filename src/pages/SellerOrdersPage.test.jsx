import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { SellerOrdersPage } from './SellerOrdersPage'
import { store } from '../store/store'
import { SET_ORDERS } from '../store/order.reducer'
import { userService } from '../services/user.service'

const seller = userService.getLoggedinUser()

function makeOrder({ id, buyerName, sellerId = seller.id, status = 'PENDING', createdAt }) {
  return {
    id,
    buyer: { id: `buyer-${id}`, fullname: buyerName, imgUrl: '' },
    seller: { id: sellerId, fullname: 'Guest Seller', imgUrl: '' },
    gig: { id: `gig-${id}`, title: `Gig ${id}`, imgUrl: '' },
    price: 45,
    status,
    createdAt,
  }
}

const testOrders = [
  makeOrder({ id: 'old', buyerName: 'Old Buyer', createdAt: 1768003200000 }),
  makeOrder({
    id: 'new',
    buyerName: 'New Buyer',
    status: 'IN_PROGRESS',
    createdAt: 1768608000000,
  }),
  makeOrder({
    id: 'newest',
    buyerName: 'Newest Buyer',
    createdAt: 1769212800000,
  }),
  makeOrder({
    id: 'other-seller',
    buyerName: 'Other Seller Buyer',
    sellerId: 'u999',
    createdAt: 1769817600000,
  }),
  makeOrder({
    id: 'delivered',
    buyerName: 'Delivered Buyer',
    status: 'DELIVERED',
    createdAt: 1770422400000,
  }),
  makeOrder({
    id: 'completed',
    buyerName: 'Completed Buyer',
    status: 'COMPLETED',
    createdAt: 1771027200000,
  }),
]

function renderPage() {
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <SellerOrdersPage />
      </MemoryRouter>
    </Provider>,
  )
}

async function findBuyerInTable(name) {
  const table = await screen.findByRole('table')
  return within(table).findByText(name)
}

describe('SellerOrdersPage', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('orderDB', JSON.stringify(testOrders))
    store.dispatch({ type: SET_ORDERS, orders: [] })
  })

  it('shows only the orders of the logged in seller', async () => {
    renderPage()

    const table = await screen.findByRole('table')
    expect(await within(table).findByText('Newest Buyer')).toBeInTheDocument()
    expect(within(table).queryByText('Other Seller Buyer')).not.toBeInTheDocument()
  })

  it('filters orders by the selected status tab', async () => {
    const user = userEvent.setup()
    renderPage()
    await findBuyerInTable('Newest Buyer')

    await user.click(screen.getByRole('tab', { name: 'In progress 1' }))

    expect(screen.getByRole('tab', { name: 'In progress 1' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    const table = screen.getByRole('table')
    expect(within(table).getByText('New Buyer')).toBeInTheDocument()
    expect(within(table).queryByText('Newest Buyer')).not.toBeInTheDocument()
  })

  it('shows the count of orders in each tab', async () => {
    renderPage()

    expect(await screen.findByRole('tab', { name: 'Pending 2' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'In progress 1' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Delivered 1' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Completed 1' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Cancelled 0' })).toBeInTheDocument()
  })

  it('sorts orders from newest to oldest', async () => {
    renderPage()

    const table = await screen.findByRole('table')
    const rows = within(table).getAllByRole('row').slice(1)
    expect(rows.map((row) => row.textContent)).toEqual([
      expect.stringContaining('Newest Buyer'),
      expect.stringContaining('Old Buyer'),
    ])
  })

  it('renders an empty state for a tab without orders', async () => {
    const user = userEvent.setup()
    renderPage()
    await findBuyerInTable('Newest Buyer')

    await user.click(screen.getByRole('tab', { name: 'Cancelled 0' }))

    expect(screen.getByText('No cancelled orders to show')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })
})
