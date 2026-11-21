import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Check, Clock } from 'lucide-react'
import { userService } from '../services/user.service'
import { PackageSelector } from './PackageSelector'

export function OrderCard({ gig }) {
  if (!gig) return null

  const packagesKey = (gig.packages || [])
    .map((pkg, idx) => pkg.id || pkg.packageId || pkg.tier || `${pkg.title}-${idx}`)
    .join('|')

  return <OrderCardContent key={`${gig.id}:${packagesKey}`} gig={gig} packagesKey={packagesKey} />
}

function OrderCardContent({ gig, packagesKey }) {
  const [statusMsg, setStatusMsg] = useState(null)
  const navigate = useNavigate()
  const loggedInUser = userService.getLoggedinUser()
  const packages = gig?.packages || []
  const ownerId = gig?.owner?.id || gig?.ownerId
  const isLoggedIn = Boolean(loggedInUser?.id)
  const isOwnGig = isLoggedIn && loggedInUser.id === ownerId

  const visibleStatus =
    statusMsg?.gigId === gig.id && statusMsg.packagesKey === packagesKey ? statusMsg : null

  function handleContinue(activePkg) {
    if (!isLoggedIn) {
      setStatusMsg({
        gigId: gig.id,
        packagesKey,
        type: 'error',
        text: 'Please log in to place an order.',
      })
      return
    }

    if (isOwnGig) {
      setStatusMsg({
        gigId: gig.id,
        packagesKey,
        type: 'error',
        text: 'You cannot order your own gig.',
      })
      return
    }

    setStatusMsg(null)
    navigate(`/checkout/${gig.id}`, {
      state: {
        packageId: packages.length ? activePkg.packageId || activePkg.id || null : null,
        selectedPackage: packages.length ? activePkg : null,
      },
    })
  }

  return (
    <div className="order-card">
      <PackageSelector
        key={`${gig.id}:${packagesKey}`}
        packages={packages}
        onSelectionChange={() => setStatusMsg(null)}
      >
        {(selectedPackage) => {
          const activePkg = selectedPackage || gig
          const features = activePkg.features || []

          return (
            <>
              <div className="order-card-header">
                <span className="order-card-price">${activePkg.price}</span>
              </div>

              <div className="order-card-time">
                <Clock size={16} />
                <span>{activePkg.daysToMake}-day delivery</span>
              </div>

              {features.length > 0 && (
                <ul className="order-card-features">
                  {features.map((feature, idx) => (
                    <li key={feature + idx}>
                      <Check size={16} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              )}

              <button
                type="button"
                className="order-card-continue-btn"
                onClick={() => handleContinue(activePkg)}
                disabled={!isLoggedIn || isOwnGig}
              >
                <span>{isOwnGig ? 'Your gig' : 'Continue'}</span>
                <ArrowRight size={18} />
              </button>

              {visibleStatus && (
                <p
                  className={`order-card-feedback ${visibleStatus.type}`}
                  role={visibleStatus.type === 'error' ? 'alert' : 'status'}
                >
                  {visibleStatus.text}
                </p>
              )}
              {!isLoggedIn && (
                <p className="order-card-feedback error" role="alert">
                  Please log in to place an order.
                </p>
              )}
              {isOwnGig && (
                <p className="order-card-feedback error" role="alert">
                  You cannot order your own gig.
                </p>
              )}
            </>
          )
        }}
      </PackageSelector>
    </div>
  )
}
