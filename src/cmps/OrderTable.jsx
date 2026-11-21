import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getNextStatuses } from '../services/order.service'

const ACTION_LABELS = {
  IN_PROGRESS: 'Approve',
  CANCELLED: 'Reject',
  DELIVERED: 'Deliver',
  COMPLETED: 'Complete',
}

const STATUS_LABELS = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In progress',
  DELIVERED: 'Delivered',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

export function OrderTable({ orders, onUpdateStatus, viewer = 'seller' }) {
  const [updatingOrderId, setUpdatingOrderId] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  async function handleUpdateStatus(orderId, status) {
    setErrorMsg('')
    setUpdatingOrderId(orderId)
    try {
      await onUpdateStatus(orderId, status)
    } catch {
      setErrorMsg('Could not update the order status. Please try again.')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  return (
    <>
      {errorMsg && (
        <p className="order-table-error" role="alert">
          {errorMsg}
        </p>
      )}
      <div className="order-table-wrapper">
        <table className="order-table">
          <thead>
            <tr>
              <th scope="col">Gig</th>
              <th scope="col">{viewer === 'seller' ? 'Buyer' : 'Seller'}</th>
              <th scope="col">Status</th>
              <th scope="col">Total</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const nextStatuses = viewer === 'seller' ? getNextStatuses(order.status) : []
              const otherParty = viewer === 'seller' ? order.buyer : order.seller

              return (
                <tr key={order.id}>
                  <td data-label="Gig">
                    <Link to={`/orders/${order.id}`} className="order-table-gig">
                      {order.gig?.title || 'Untitled gig'}
                    </Link>
                  </td>
                  <td data-label={viewer === 'seller' ? 'Buyer' : 'Seller'}>
                    {otherParty?.fullname || '—'}
                  </td>
                  <td data-label="Status">{STATUS_LABELS[order.status] || order.status}</td>
                  <td data-label="Total">${Number(order.total ?? order.price ?? 0).toFixed(2)}</td>
                  <td data-label="Actions">
                    <div className="order-table-actions">
                      {nextStatuses.map((status) => (
                        <button
                          key={status}
                          type="button"
                          className="order-status-action"
                          disabled={updatingOrderId === order.id}
                          onClick={() => handleUpdateStatus(order.id, status)}
                        >
                          {ACTION_LABELS[status]}
                        </button>
                      ))}
                      {viewer === 'buyer' && (
                        <Link to={`/orders/${order.id}`} className="order-status-action">
                          View
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
