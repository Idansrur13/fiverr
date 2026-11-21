import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Check, Clock } from 'lucide-react'
import { addOrder } from '../store/order.actions'
import { userService } from '../services/user.service'
import { PackageSelector } from './PackageSelector'

export function OrderCard({ gig }) {
  const navigate = useNavigate()
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [isCreating, setIsCreating] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)

  if (!gig) return null

  const buyer = userService.getLoggedinUser()
  const isOwnGig = buyer.id === gig.owner?.id
  const packages = gig.packages || []
  const selectedPkg = packages[selectedIdx] || null
  const { price, daysToMake, features = [] } = selectedPkg || gig

  function onSelectPackage(idx) {
    setSelectedIdx(idx)
    setErrorMsg(null)
  }

  async function handleContinue() {
    setIsCreating(true)
    setErrorMsg(null)
    try {
      await addOrder({ gig, buyer, pkg: selectedPkg })
      navigate('/orders')
    } catch {
      setErrorMsg('Failed to create order. Please try again.')
      setIsCreating(false)
    }
  }

  return (
    <div className="order-card">
      {packages.length > 1 && (
        <PackageSelector packages={packages} selectedIdx={selectedIdx} onSelect={onSelectPackage} />
      )}
      <div className="order-card-header">
        <span className="order-card-price">${price}</span>
      </div>

      <div className="order-card-time">
        <Clock size={16} />
        <span>{daysToMake}-day delivery</span>
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

      {isOwnGig && <p className="order-card-note">You can&apos;t order your own gig</p>}
      {errorMsg && (
        <p className="order-card-error" role="alert">
          {errorMsg}
        </p>
      )}

      <button
        type="button"
        className="order-card-continue-btn"
        onClick={handleContinue}
        disabled={isCreating || isOwnGig}
      >
        <span>Continue</span>
        <ArrowRight size={18} />
      </button>
    </div>
  )
}
