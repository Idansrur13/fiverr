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

function formatOrderDate(dateValue) {
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(date)
}

function formatPrice(price) {
  const amount = Number(price)
  return Number.isFinite(amount) ? `$${amount.toFixed(2)}` : '—'
}

export function OrderTable({ orders, onUpdateStatus, viewer = 'seller' }) {
  const [updatingOrderId, setUpdatingOrderId] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const isSeller = viewer === 'seller'
  const partyLabel = isSeller ? 'Buyer' : 'Seller'
  const priceLabel = isSeller ? 'Price' : 'Total'

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
              <th scope="col">{partyLabel}</th>
              <th scope="col">Gig</th>
              <th scope="col">Order date</th>
              <th scope="col">{priceLabel}</th>
              <th scope="col">Status</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const party = isSeller ? order.buyer : order.seller
              const nextStatuses = isSeller ? getNextStatuses(order.status) : []
              const amount = isSeller ? order.price : (order.total ?? order.price)

              return (
                <tr key={order.id}>
                  <td data-label={partyLabel}>
                    <div className="order-table-party">
                      {party?.imgUrl && <img src={party.imgUrl} alt="" />}
                      <span>{party?.fullname || `Unknown ${partyLabel.toLowerCase()}`}</span>
                    </div>
                  </td>
                  <td data-label="Gig">
                    <Link to={`/orders/${order.id}`} className="order-table-gig">
                      {order.gig?.title || 'Unknown gig'}
                    </Link>
                  </td>
                  <td data-label="Order date">{formatOrderDate(order.createdAt)}</td>
                  <td data-label={priceLabel}>{formatPrice(amount)}</td>
                  <td data-label="Status">{STATUS_LABELS[order.status] || order.status}</td>
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
                      {!isSeller && (
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
