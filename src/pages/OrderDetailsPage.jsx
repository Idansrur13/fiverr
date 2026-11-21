import { useLocation, useParams } from 'react-router-dom'

export function OrderDetailsPage() {
  const { orderId } = useParams()
  const { state } = useLocation()

  if (state?.paymentConfirmed) {
    return (
      <section className="order-details-page">
        <h1>Order confirmation</h1>
        <p role="status">Your order has been placed successfully.</p>
        <p>Order ID: {orderId}</p>
      </section>
    )
  }

  return (
    <section className="order-details-page">
      <h1>Order Details</h1>
    </section>
  )
}
