import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Check, Clock } from 'lucide-react'
import { userService } from '../services/user.service'
import { PackageSelector } from './PackageSelector'

export function OrderCard({ gig }) {
  const navigate = useNavigate()
  const [selectedIdx, setSelectedIdx] = useState(0)

  if (!gig) return null

  const buyer = userService.getLoggedinUser()
  const isOwnGig = buyer?.id === (gig.owner?.id || gig.ownerId)
  const packages = gig.packages || []
  const selectedPkg = packages[selectedIdx] ?? packages[0] ?? null
  const { price, daysToMake, features = [] } = selectedPkg || gig

  function onSelectPackage(idx) {
    setSelectedIdx(idx)
  }

  function handleContinue() {
    navigate(`/checkout/${gig.id}`, {
      state: {
        packageId: selectedPkg?.packageId || selectedPkg?.id || null,
        selectedPackage: selectedPkg,
      },
    })
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
      <button
        type="button"
        className="order-card-continue-btn"
        onClick={handleContinue}
        disabled={isOwnGig}
      >
        <span>Continue</span>
        <ArrowRight size={18} />
      </button>
    </div>
  )
}
