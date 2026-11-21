export function OrderSummary({ gig, price, serviceFee, total }) {
  const image = gig.images?.[0] || gig.imgUrl

  return (
    <section className="order-summary" aria-labelledby="order-summary-title">
      <h2 id="order-summary-title">Order summary</h2>
      <div className="order-summary-gig">
        {image && (
          <img src={image} alt={`${gig.title} thumbnail`} className="order-summary-image" />
        )}
        <h3>{gig.title}</h3>
      </div>
      <dl className="order-summary-totals">
        <div>
          <dt>Price</dt>
          <dd>${price.toFixed(2)}</dd>
        </div>
        <div>
          <dt>Service fee (5.5%)</dt>
          <dd>${serviceFee.toFixed(2)}</dd>
        </div>
        <div className="order-summary-total">
          <dt>Total</dt>
          <dd>${total.toFixed(2)}</dd>
        </div>
      </dl>
    </section>
  )
}
