import { SERVICE_FEE_RATE } from '../services/pricing.service'

const SERVICE_FEE_LABEL = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 2,
}).format(SERVICE_FEE_RATE)

export function OrderSummary({ gig, pkg = null, price, serviceFee, total }) {
  const { daysToMake } = pkg || gig
  const image = gig.images?.[0]

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
        {pkg && (
          <div>
            <dt>Package</dt>
            <dd>{pkg.title || pkg.tier}</dd>
          </div>
        )}
        <div>
          <dt>Delivery</dt>
          <dd>{daysToMake === 1 ? '1 day' : `${daysToMake} days`}</dd>
        </div>
        <div>
          <dt>Price</dt>
          <dd>${price.toFixed(2)}</dd>
        </div>
        <div>
          <dt>Service fee ({SERVICE_FEE_LABEL})</dt>
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
