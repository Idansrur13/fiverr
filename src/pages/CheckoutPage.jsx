import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'

import { gigService } from '../services/gig.service'
import { userService } from '../services/user.service'
import { addOrder } from '../store/order.actions'

const SERVICE_FEE_RATE = 0.05

export function CheckoutPage() {
  const { gigId } = useParams()
  const location = useLocation()
  const [gig, setGig] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const submittingRef = useRef(false)
  const buyer = userService.getLoggedinUser()

  useEffect(() => {
    let isCancelled = false

    async function fetchGig() {
      setIsLoading(true)
      setError(null)
      try {
        const loadedGig = await gigService.getById(gigId)
        if (!isCancelled) setGig(loadedGig)
      } catch {
        if (!isCancelled) setError('Could not load this gig. Please try again.')
      } finally {
        if (!isCancelled) setIsLoading(false)
      }
    }

    fetchGig()

    return () => {
      isCancelled = true
    }
  }, [gigId])

  if (isLoading) return <div className="loader">Loading checkout...</div>
  if (error)
    return (
      <p className="error-msg" role="alert">
        {error}
      </p>
    )
  if (!gig)
    return (
      <p className="error-msg" role="alert">
        Gig not found
      </p>
    )

  const packages = gig.packages || []
  const requestedPackageId = location.state?.packageId
  const requestedPackage = location.state?.selectedPackage
  const activePackage = packages.length
    ? packages.find(
        (pkg) => pkg.id === requestedPackageId || pkg.packageId === requestedPackageId,
      ) ||
      packages.find((pkg) => pkg.tier === requestedPackage?.tier) ||
      packages[0]
    : gig
  const packageId = packages.length ? activePackage.packageId || activePackage.id || null : null
  const price = Number(activePackage.price)
  const serviceFee = Math.round(price * SERVICE_FEE_RATE * 100) / 100
  const total = Math.round((price + serviceFee) * 100) / 100
  const sellerId = gig.owner?.id || gig.ownerId
  const isLoggedIn = Boolean(buyer?.id)
  const isOwnGig = isLoggedIn && buyer.id === sellerId

  async function handlePlaceOrder() {
    if (!isLoggedIn) {
      setError('Please log in to place an order.')
      return
    }
    if (isOwnGig) {
      setError('You cannot order your own gig.')
      return
    }
    if (submittingRef.current) return

    submittingRef.current = true
    setIsSubmitting(true)
    setError(null)
    try {
      await addOrder({
        gig: {
          ...gig,
          price,
          daysToMake: activePackage.daysToMake,
        },
        buyer,
        packageId,
        serviceFee,
        total,
      })
      setSuccess(true)
    } catch {
      setError('Could not place your order. Please try again.')
    } finally {
      submittingRef.current = false
      setIsSubmitting(false)
    }
  }

  return (
    <section className="checkout-page">
      <h1>Checkout</h1>
      {error && (
        <p className="error-msg" role="alert">
          {error}
        </p>
      )}
      {success ? (
        <p role="status">Order created successfully!</p>
      ) : (
        <>
          <h2>{gig.title}</h2>
          {packages.length > 0 && <p>Package: {activePackage.title || activePackage.tier}</p>}
          <p>Price: ${price.toFixed(2)}</p>
          <p>Service fee (5%): ${serviceFee.toFixed(2)}</p>
          <p>Total: ${total.toFixed(2)}</p>
          {!isLoggedIn && <p role="alert">Please log in to place an order.</p>}
          {isOwnGig && <p role="alert">You cannot order your own gig.</p>}
          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={!isLoggedIn || isOwnGig || isSubmitting}
          >
            {isSubmitting ? 'Placing order...' : 'Place order'}
          </button>
        </>
      )}
      <Link to={`/gig/${gig.id}`}>Back to gig</Link>
    </section>
  )
}
