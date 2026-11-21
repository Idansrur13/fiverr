import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import demoGigs from '../data/gigs.json'
import { OrderSummary } from '../cmps/OrderSummary'
import { gigService } from '../services/gig.service'
import { calcOrderTotal } from '../services/order.service'
import { userService } from '../services/user.service'
import { addOrder } from '../store/order.actions'

export function CheckoutPage() {
  const { gigId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [gig, setGig] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cardholderName, setCardholderName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let isCancelled = false

    async function loadGig() {
      setIsLoading(true)
      setError(null)
      setGig(null)

      try {
        const loadedGig = await gigService.getById(gigId)
        if (!isCancelled) setGig(loadedGig)
      } catch (err) {
        const demoGig = demoGigs.find((item) => item.id === gigId)
        if (!isCancelled && demoGig) {
          setGig(demoGig)
        } else if (!isCancelled) {
          setError(
            err?.message?.startsWith('Cannot find')
              ? 'Gig not found'
              : 'Failed to load gig. Please try again later.',
          )
        }
      } finally {
        if (!isCancelled) setIsLoading(false)
      }
    }

    loadGig()
    return () => {
      isCancelled = true
    }
  }, [gigId])

  if (isLoading) return <div className="loader">Loading checkout...</div>
  if (error)
    return (
      <section className="checkout-page">
        <p className="error-msg" role="alert">
          {error}
        </p>
        <Link to={`/gig/${gigId}`}>Back to gig</Link>
      </section>
    )
  if (!gig)
    return (
      <section className="checkout-page">
        <p className="error-msg" role="alert">
          Gig not found
        </p>
      </section>
    )

  const packages = gig.packages || []
  const requestedPackageId = location.state?.packageId
  const statePackage = location.state?.selectedPackage
  const selectedPackage = packages.length
    ? packages.find(
        (pkg) => pkg.id === requestedPackageId || pkg.packageId === requestedPackageId,
      ) ||
      packages.find((pkg) => pkg.tier === statePackage?.tier) ||
      statePackage ||
      packages[0]
    : null
  const orderItem = selectedPackage
    ? { ...gig, price: selectedPackage.price, daysToMake: selectedPackage.daysToMake }
    : gig
  const totals = calcOrderTotal(orderItem.price)
  const buyer = userService.getLoggedinUser()
  const isLoggedIn = Boolean(buyer?.id)
  const sellerId = gig.owner?.id || gig.ownerId
  const isOwnGig = isLoggedIn && buyer.id === sellerId

  async function handleSubmit(event) {
    event.preventDefault()
    if (isSubmitting || !isLoggedIn || isOwnGig) return

    setIsSubmitting(true)
    setError(null)
    try {
      const order = await addOrder({
        gig: orderItem,
        buyer,
        pkg: selectedPackage,
        serviceFee: totals.serviceFee,
        total: totals.total,
      })
      navigate(`/orders/${order.id}`, {
        state: { paymentConfirmed: true },
      })
    } catch {
      setError('Could not complete the order. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <main className="checkout-page">
      <header className="checkout-page-header">
        <h1>Checkout</h1>
        <p>Secure your order with a quick demo checkout.</p>
      </header>

      <div className="checkout-layout">
        <form className="checkout-payment-form" onSubmit={handleSubmit}>
          <h2>Payment details</h2>
          <p className="checkout-demo-note">
            Demo payment only. No card details are requested or stored.
          </p>

          <label htmlFor="cardholder-name">Cardholder name</label>
          <input
            id="cardholder-name"
            name="cardholderName"
            type="text"
            autoComplete="cc-name"
            value={cardholderName}
            onChange={(event) => setCardholderName(event.target.value)}
            required
          />

          {!isLoggedIn && (
            <p className="checkout-error" role="alert">
              Please log in to place an order.
            </p>
          )}
          {isOwnGig && (
            <p className="checkout-error" role="alert">
              You cannot order your own gig.
            </p>
          )}
          {error && (
            <p className="checkout-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" disabled={!isLoggedIn || isOwnGig || isSubmitting}>
            {isSubmitting ? 'Processing...' : 'Confirm & Pay'}
          </button>
        </form>

        <OrderSummary gig={gig} {...totals} />
      </div>
      <Link className="checkout-back-link" to={`/gig/${gig.id}`}>
        Back to gig
      </Link>
    </main>
  )
}
