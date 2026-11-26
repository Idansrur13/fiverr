import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { OrderTimeline } from '../cmps/OrderTimeline'
import { orderService } from '../services/order.service'
import { userService } from '../services/user.service'

function getErrorMessage(error) {
  const status = error?.status || error?.response?.status
  if (status === 404 || error?.code === 'NOT_FOUND') return 'Order not found.'
  if (status === 403 || error?.code === 'FORBIDDEN') {
    return 'You do not have permission to view this order.'
  }
  return 'Could not load this order. Please try again.'
}

function getPartyId(order, role) {
  return order[`${role}Id`] || order[role]?.id
}

function formatCurrency(value) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return '$0.00'
  return `$${(Math.round((amount + Number.EPSILON) * 100) / 100).toFixed(2)}`
}

function formatDate(value) {
  if (value == null || value === '') return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(date)
}

function getDeliveryDays(order) {
  const packageDays = Number(order.package?.daysToMake)
  if (Number.isFinite(packageDays) && packageDays > 0) return packageDays
  if (order.createdAt == null || order.dueAt == null) return '—'

  const duration = new Date(order.dueAt).getTime() - new Date(order.createdAt).getTime()
  if (!Number.isFinite(duration) || duration < 0) return '—'
  return Math.ceil(duration / (24 * 60 * 60 * 1000))
}

function getPriceBreakdown(order) {
  const price = Number(order.price ?? order.package?.price ?? order.gig?.price)
  const safePrice = Number.isFinite(price) ? price : 0
  const serviceFee = Number(order.serviceFee)
  const safeServiceFee = Number.isFinite(serviceFee) ? serviceFee : 0
  const total = Number(order.total)

  return {
    price: safePrice,
    serviceFee: safeServiceFee,
    total: Number.isFinite(total) ? total : safePrice + safeServiceFee,
  }
}

export function OrderDetailsPage() {
  const { id, orderId } = useParams()
  const orderIdFromUrl = orderId || id
  const { state } = useLocation()
  const [order, setOrder] = useState(null)
  const [loadState, setLoadState] = useState({ orderId: null, isLoading: true, error: '' })

  useEffect(() => {
    if (state?.paymentConfirmed || !orderIdFromUrl) return

    let isCancelled = false

    orderService
      .getById(orderIdFromUrl)
      .then((loadedOrder) => {
        if (isCancelled) return
        if (!loadedOrder) {
          setLoadState({ orderId: orderIdFromUrl, isLoading: false, error: 'Order not found.' })
          return
        }

        const userId = userService.getLoggedinUser()?.id
        const isOrderParty =
          userId &&
          (getPartyId(loadedOrder, 'buyer') === userId ||
            getPartyId(loadedOrder, 'seller') === userId)
        if (!isOrderParty) {
          setLoadState({
            orderId: orderIdFromUrl,
            isLoading: false,
            error: 'You do not have permission to view this order.',
          })
          return
        }

        setOrder(loadedOrder)
        setLoadState({ orderId: orderIdFromUrl, isLoading: false, error: '' })
      })
      .catch((error) => {
        if (!isCancelled) {
          setLoadState({
            orderId: orderIdFromUrl,
            isLoading: false,
            error: getErrorMessage(error),
          })
        }
      })

    return () => {
      isCancelled = true
    }
  }, [orderIdFromUrl, state?.paymentConfirmed])

  const isCurrentOrderLoading =
    !state?.paymentConfirmed &&
    Boolean(orderIdFromUrl) &&
    (loadState.orderId !== orderIdFromUrl || loadState.isLoading)

  if (!state?.paymentConfirmed && !orderIdFromUrl) {
    return (
      <section className="order-details-page">
        <h1>Order details</h1>
        <p className="order-details-error" role="alert">
          Order not found.
        </p>
        <Link to="/orders">Back to orders</Link>
      </section>
    )
  }

  if (isCurrentOrderLoading) {
    return (
      <section className="order-details-page">
        <p className="order-details-message" role="status">
          Loading order...
        </p>
      </section>
    )
  }

  if (loadState.error) {
    return (
      <section className="order-details-page">
        <h1>Order details</h1>
        <p className="order-details-error" role="alert">
          {loadState.error}
        </p>
        <Link to="/orders">Back to orders</Link>
      </section>
    )
  }

  if (state?.paymentConfirmed) {
    return (
      <section className="order-details-page">
        <h1>Order confirmation</h1>
        <p role="status">Your order has been placed successfully.</p>
        <p>Order ID: {orderIdFromUrl}</p>
        <Link to="/orders">View your orders</Link>
      </section>
    )
  }

  if (!order) return null

  const { price, serviceFee, total } = getPriceBreakdown(order)
  const gigId = order.gigId || order.gig?.id
  const itemName =
    order.package?.title || order.package?.tier || order.gig?.title || order.title || 'Order item'
  const quantity = Number.isFinite(Number(order.quantity)) ? Number(order.quantity) : 1
  const deliveryDays = getDeliveryDays(order)

  return (
    <section className="order-details-page">
      <header className="order-details-header">
        <div>
          <p className="order-details-eyebrow">Order details</p>
          <h1>{order.gig?.title || 'Your order'}</h1>
          <p className="order-details-number">Order #{order.id}</p>
        </div>
        <p className="order-details-due">
          Delivery due <strong>{formatDate(order.dueAt)}</strong>
        </p>
      </header>

      <OrderTimeline status={order.status} />

      <div className="order-details-layout">
        <main className="order-details-main">
          <section className="order-details-card" aria-labelledby="order-item-title">
            <h2 id="order-item-title">Order item</h2>
            <div className="order-details-gig">
              {order.gig?.imgUrl && <img src={order.gig.imgUrl} alt="" />}
              <div>
                <h3>{itemName}</h3>
                <p>Seller: {order.seller?.fullname || 'Seller'}</p>
              </div>
            </div>
            <div className="order-details-table-wrapper">
              <table className="order-details-price-table">
                <thead>
                  <tr>
                    <th scope="col">Item</th>
                    <th scope="col">Quantity</th>
                    <th scope="col">Days</th>
                    <th scope="col">Price</th>
                    <th scope="col">Service fee</th>
                    <th scope="col">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{itemName}</td>
                    <td>{quantity}</td>
                    <td>{deliveryDays}</td>
                    <td>{formatCurrency(price)}</td>
                    <td>{formatCurrency(serviceFee)}</td>
                    <td>{formatCurrency(total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </main>

        <aside className="order-details-summary" aria-labelledby="order-summary-title">
          <h2 id="order-summary-title">Summary</h2>
          <dl>
            <div>
              <dt>Item</dt>
              <dd>{formatCurrency(price)}</dd>
            </div>
            <div>
              <dt>Service fee</dt>
              <dd>{formatCurrency(serviceFee)}</dd>
            </div>
            <div className="order-details-summary-total">
              <dt>Total</dt>
              <dd>{formatCurrency(total)}</dd>
            </div>
          </dl>
          {gigId ? (
            <Link className="order-details-again" to={`/gig/${gigId}`}>
              Order again
            </Link>
          ) : (
            <button className="order-details-again" type="button" disabled>
              Order again
            </button>
          )}
        </aside>
      </div>
    </section>
  )
}
