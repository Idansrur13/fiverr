import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { BuyerOrdersPage } from './BuyerOrdersPage'
import { SellerOrdersPage } from './SellerOrdersPage'
import { store } from '../store/store'
import { SET_ORDERS } from '../store/order.reducer'

const order = {
  id: 'order-1',
  buyer: { id: 'u201', fullname: 'Liam Brooks', imgUrl: '' },
  seller: { id: 'u100', fullname: 'Guest Seller', imgUrl: '' },
  gig: { id: 'g1', title: 'Logo design', imgUrl: '' },
  price: 45,
  serviceFee: 2.48,
  total: 47.48,
  status: 'PENDING',
  createdAt: 1768003200000,
  dueAt: 1768262400000,
}

function renderOrdersPage(page) {
  return render(
    <Provider store={store}>
      <MemoryRouter>{page}</MemoryRouter>
    </Provider>,
  )
}

describe('Orders pages', () => {
  beforeEach(() => {
    localStorage.clear()
    store.dispatch({ type: SET_ORDERS, orders: [] })
  })

  it('moves an updated seller order to its new status tab and persists the status', async () => {
    localStorage.setItem('orderDB', JSON.stringify([order]))
    const user = userEvent.setup()
    renderOrdersPage(<SellerOrdersPage />)

    const pendingRow = await screen.findByRole('row', { name: /Logo design/ })
    await user.click(within(pendingRow).getByRole('button', { name: 'Approve' }))

    expect(await screen.findByRole('heading', { name: 'In progress orders' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'In progress 1' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByRole('row', { name: /Logo design/ })).toHaveTextContent('In progress')
    expect(JSON.parse(localStorage.getItem('orderDB'))[0].status).toBe('IN_PROGRESS')
  })

  it('shows the updated order status in the buyer order list and status tab', async () => {
    localStorage.setItem(
      'orderDB',
      JSON.stringify([{ ...order, buyer: { id: 'u100' }, status: 'DELIVERED' }]),
    )
    const user = userEvent.setup()
    renderOrdersPage(<BuyerOrdersPage />)

    const deliveredRow = await screen.findByRole('row', { name: /Logo design/ })
    expect(within(deliveredRow).getByText('Delivered')).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Delivered 1' }))
    expect(screen.getByRole('heading', { name: 'Delivered orders' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Delivered 1' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })
})
