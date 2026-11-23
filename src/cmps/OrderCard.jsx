import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { userService } from '../services/user.service'
import { findPackage } from '../services/package.service'
import { PackageSelector } from './PackageSelector'

export function OrderCard({ gig }) {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  if (!gig) return null

  const buyer = userService.getLoggedinUser()
  const isOwnGig = buyer.id === gig.owner?.id
  const packages = gig.packages || []
  const selectedPkg = findPackage(packages, searchParams.get('package')) || packages[0] || null
  const shownPackages = packages.length
    ? packages
    : [{ price: gig.price, daysToMake: gig.daysToMake }]
  const selectedIdx = selectedPkg ? packages.indexOf(selectedPkg) : 0

  function onSelectPackage(idx) {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('package', packages[idx].tier)
    setSearchParams(nextParams, { replace: true })
  }

  function handleContinue() {
    const query = selectedPkg ? `?package=${selectedPkg.tier}` : ''
    navigate(`/checkout/${gig.id}${query}`, { state: { packageId: selectedPkg?.id } })
  }

  return (
    <div className="order-card">
      <PackageSelector
        packages={shownPackages}
        selectedIdx={selectedIdx}
        onSelect={onSelectPackage}
      />

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
