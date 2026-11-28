import { Link, useNavigate } from 'react-router-dom'

const STATUS_LABELS = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In progress',
  DELIVERED: 'Delivered',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

function formatDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(date)
}

function formatPrice(value) {
  const amount = Number(value)
  return Number.isFinite(amount) ? `$${amount.toFixed(2)}` : '—'
}

function OrderAgainLink({ gigId }) {
  if (!gigId) return null
  return (
    <Link
      className="buyer-order-again"
      to={`/gig/${gigId}`}
      onClick={(event) => event.stopPropagation()}
    >
      Order again
    </Link>
  )
}

export function OrderList({ orders }) {
  const navigate = useNavigate()

  function openOrder(orderId) {
    navigate(`/orders/${orderId}`)
  }

  function handleRowKeyDown(event, orderId) {
    if (event.target !== event.currentTarget) return

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openOrder(orderId)
    }
  }

  return (
    <div className="buyer-order-list">
      <div className="buyer-order-table-wrapper">
        <table className="buyer-order-table">
          <thead>
            <tr>
              <th scope="col">Gig</th>
              <th scope="col">Seller</th>
              <th scope="col">Order date</th>
              <th scope="col">Due date</th>
              <th scope="col">Amount</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                tabIndex="0"
                onClick={() => openOrder(order.id)}
                onKeyDown={(event) => handleRowKeyDown(event, order.id)}
              >
                <td data-label="Gig">
                  <div className="buyer-order-gig">
                    {order.gig?.imgUrl && <img src={order.gig.imgUrl} alt="" />}
                    <span>{order.gig?.title || 'Gig'}</span>
                    {order.status === 'COMPLETED' && <OrderAgainLink gigId={order.gig?.id} />}
                  </div>
                </td>
                <td data-label="Seller">{order.seller?.fullname || 'Seller'}</td>
                <td data-label="Order date">{formatDate(order.createdAt)}</td>
                <td data-label="Due date">{formatDate(order.dueAt)}</td>
                <td data-label="Amount">{formatPrice(order.total ?? order.price)}</td>
                <td data-label="Status">
                  <span className="buyer-order-status" data-status={order.status}>
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="buyer-order-cards">
        {orders.map((order) => (
          <article
            key={order.id}
            className="buyer-order-card"
            tabIndex="0"
            onClick={() => openOrder(order.id)}
            onKeyDown={(event) => handleRowKeyDown(event, order.id)}
          >
            <div className="buyer-order-card-gig">
              {order.gig?.imgUrl && <img src={order.gig.imgUrl} alt="" />}
              <h3>{order.gig?.title || 'Gig'}</h3>
            </div>
            <dl className="buyer-order-card-details">
              <div>
                <dt>Seller</dt>
                <dd>{order.seller?.fullname || 'Seller'}</dd>
              </div>
              <div>
                <dt>Order date</dt>
                <dd>{formatDate(order.createdAt)}</dd>
              </div>
              <div>
                <dt>Due date</dt>
                <dd>{formatDate(order.dueAt)}</dd>
              </div>
              <div>
                <dt>Amount</dt>
                <dd>{formatPrice(order.total ?? order.price)}</dd>
              </div>
            </dl>
            <div className="buyer-order-card-footer">
              <span className="buyer-order-status" data-status={order.status}>
                {STATUS_LABELS[order.status] || order.status}
              </span>
              {order.status === 'COMPLETED' && <OrderAgainLink gigId={order.gig?.id} />}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
