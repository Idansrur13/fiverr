import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { OrderTable } from './OrderTable'

const orders = [
  { id: 'pending', status: 'PENDING', gig: { title: 'Pending gig' } },
  { id: 'in-progress', status: 'IN_PROGRESS', gig: { title: 'Active gig' } },
  { id: 'delivered', status: 'DELIVERED', gig: { title: 'Delivered gig' } },
  { id: 'completed', status: 'COMPLETED', gig: { title: 'Completed gig' } },
  { id: 'cancelled', status: 'CANCELLED', gig: { title: 'Cancelled gig' } },
]

function renderOrderTable(element) {
  return render(<MemoryRouter>{element}</MemoryRouter>)
}

describe('OrderTable', () => {
  it('shows only the actions allowed for the order status', () => {
    renderOrderTable(<OrderTable orders={orders} onUpdateStatus={() => {}} />)

    const pendingRow = screen.getByRole('row', { name: /Pending gig/ })
    expect(within(pendingRow).getByRole('button', { name: 'Approve' })).toBeInTheDocument()
    expect(within(pendingRow).getByRole('button', { name: 'Reject' })).toBeInTheDocument()
    expect(within(pendingRow).queryByRole('button', { name: 'Deliver' })).not.toBeInTheDocument()

    const inProgressRow = screen.getByRole('row', { name: /Active gig/ })
    expect(within(inProgressRow).getByRole('button', { name: 'Deliver' })).toBeInTheDocument()
    expect(within(inProgressRow).queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument()

    const deliveredRow = screen.getByRole('row', { name: /Delivered gig/ })
    expect(within(deliveredRow).getByRole('button', { name: 'Complete' })).toBeInTheDocument()

    for (const title of ['Completed gig', 'Cancelled gig']) {
      const row = screen.getByRole('row', { name: new RegExp(title) })
      expect(within(row).queryByRole('button')).not.toBeInTheDocument()
    }
  })

  it('updates the order status when an action is clicked', async () => {
    const user = userEvent.setup()

    function StatefulOrderTable() {
      const [currentOrders, setCurrentOrders] = useState([orders[0]])

      async function handleUpdate(orderId, status) {
        setCurrentOrders((current) =>
          current.map((order) => (order.id === orderId ? { ...order, status } : order)),
        )
      }

      return <OrderTable orders={currentOrders} onUpdateStatus={handleUpdate} />
    }

    renderOrderTable(<StatefulOrderTable />)
    const pendingRow = screen.getByRole('row', { name: /Pending gig/ })
    await user.click(within(pendingRow).getByRole('button', { name: 'Approve' }))

    expect(await screen.findByText('In progress')).toBeInTheDocument()
    expect(screen.getByRole('row', { name: /Pending gig/ })).toHaveTextContent('In progress')
    expect(screen.getByRole('button', { name: 'Deliver' })).toBeInTheDocument()
  })
})
