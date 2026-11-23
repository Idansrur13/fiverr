import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { OrderSummary } from '../cmps/OrderSummary'
import { gigService } from '../services/gig.service'
import { calcOrderTotal } from '../services/pricing.service'
import { userService } from '../services/user.service'
import { addOrder } from '../store/order.actions'

export function CheckoutPage() {
  const { gigId } = useParams()
  const { state } = useLocation()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [gig, setGig] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [submitError, setSubmitError] = useState(null)
  const [cardholderName, setCardholderName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let isCancelled = false

    async function loadGig() {
      setIsLoading(true)
      setLoadError(null)
      setGig(null)

      try {
        const loadedGig = await gigService.getById(gigId)
        if (!isCancelled) setGig(loadedGig)
      } catch (err) {
        if (!isCancelled) {
          setLoadError(
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
  if (!gig)
    return (
      <section className="checkout-page">
        <p className="error-msg" role="alert">
          {loadError}
        </p>
        <Link to={`/gig/${gigId}`}>Back to gig</Link>
      </section>
    )

  const packages = gig.packages || []
  const requestedPackage = state?.packageId || searchParams.get('package')
  const requestedPkg =
    requestedPackage &&
    packages.find(
      (pkg) =>
        pkg.id === requestedPackage ||
        String(pkg.tier || '').toUpperCase() === String(requestedPackage).toUpperCase(),
    )
  const selectedPkg = requestedPkg || packages[0] || null
  const totals = calcOrderTotal((selectedPkg || gig).price)
  const buyer = userService.getLoggedinUser()
  const isLoggedIn = Boolean(buyer?.id)
  const isOwnGig = isLoggedIn && buyer.id === gig.owner?.id

  async function handleSubmit(event) {
    event.preventDefault()
    if (isSubmitting || !isLoggedIn || isOwnGig) return

    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const order = await addOrder({ gig, buyer, pkg: selectedPkg })
      navigate(`/orders/${order.id}`, {
        state: { paymentConfirmed: true },
      })
    } catch {
      setSubmitError('Could not complete the order. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <section className="checkout-page">
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
          {submitError && (
            <p className="checkout-error" role="alert">
              {submitError}
            </p>
          )}

          <button type="submit" disabled={!isLoggedIn || isOwnGig || isSubmitting}>
            {isSubmitting ? 'Processing...' : 'Confirm & Pay'}
          </button>
        </form>

        <OrderSummary gig={gig} pkg={selectedPkg} {...totals} />
      </div>
      <Link className="checkout-back-link" to={`/gig/${gig.id}`}>
        Back to gig
      </Link>
    </section>
  )
}
