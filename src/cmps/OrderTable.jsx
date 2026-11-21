function formatOrderDate(dateValue) {
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(date)
}

function formatPrice(price) {
  const amount = Number(price)
  return Number.isFinite(amount) ? `$${amount.toFixed(2)}` : '—'
}

function getStatusLabel(status) {
  return (
    {
      PENDING: 'Pending',
      IN_PROGRESS: 'In progress',
      DELIVERED: 'Delivered',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled',
    }[status] || status
  )
}

export function OrderTable({ orders }) {
  return (
    <>
      <div className="seller-orders-table-wrapper">
        <table className="seller-orders-table">
          <thead>
            <tr>
              <th scope="col">Buyer</th>
              <th scope="col">Gig</th>
              <th scope="col">Order date</th>
              <th scope="col">Price</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td data-label="Buyer">
                  <div className="seller-order-buyer">
                    {order.buyer?.imgUrl && <img src={order.buyer.imgUrl} alt="" />}
                    <span>{order.buyer?.fullname || 'Unknown buyer'}</span>
                  </div>
                </td>
                <td data-label="Gig">{order.gig?.title || 'Unknown gig'}</td>
                <td data-label="Order date">{formatOrderDate(order.createdAt)}</td>
                <td data-label="Price">{formatPrice(order.price)}</td>
                <td data-label="Status">{getStatusLabel(order.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="seller-orders-cards">
        {orders.map((order) => (
          <article className="seller-order-card" key={order.id}>
            <div className="seller-order-card-field">
              <span className="seller-order-card-label">Buyer</span>
              <div className="seller-order-buyer">
                {order.buyer?.imgUrl && <img src={order.buyer.imgUrl} alt="" />}
                <span>{order.buyer?.fullname || 'Unknown buyer'}</span>
              </div>
            </div>
            <div className="seller-order-card-field">
              <span className="seller-order-card-label">Gig</span>
              <span>{order.gig?.title || 'Unknown gig'}</span>
            </div>
            <div className="seller-order-card-meta">
              <div className="seller-order-card-field">
                <span className="seller-order-card-label">Order date</span>
                <span>{formatOrderDate(order.createdAt)}</span>
              </div>
              <div className="seller-order-card-field">
                <span className="seller-order-card-label">Price</span>
                <span>{formatPrice(order.price)}</span>
              </div>
              <div className="seller-order-card-field">
                <span className="seller-order-card-label">Status</span>
                <span>{getStatusLabel(order.status)}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  )
}
