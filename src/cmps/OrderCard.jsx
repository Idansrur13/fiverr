import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { userService } from '../services/user.service'
import { PackageSelector } from './PackageSelector'

export function OrderCard({ gig }) {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const packages = useMemo(() => {
    if (!gig) return []
    return Array.isArray(gig.packages) && gig.packages.length
      ? gig.packages
      : [
          {
            id: gig.packageId || gig.id,
            tier: gig.tier || 'BASIC',
            title: 'Basic',
            description: '',
            price: gig.price,
            daysToMake: gig.daysToMake,
            revisions: gig.revisions,
            features: gig.features || [],
          },
        ]
  }, [gig])
  const [selectedIdx, setSelectedIdx] = useState(() => {
    const requested = searchParams.get('package')
    const requestedIdx = requested
      ? packages.findIndex(
          (pkg) =>
            pkg.id === requested ||
            String(pkg.tier || '').toUpperCase() === requested.toUpperCase(),
        )
      : -1
    return requestedIdx >= 0 ? requestedIdx : 0
  })
  const [previousGigId, setPreviousGigId] = useState(gig?.id)
  if (gig && previousGigId !== gig.id) {
    setPreviousGigId(gig.id)
    const requested = searchParams.get('package')
    const requestedIdx = requested
      ? packages.findIndex(
          (pkg) =>
            pkg.id === requested ||
            String(pkg.tier || '').toUpperCase() === requested.toUpperCase(),
        )
      : -1
    setSelectedIdx(requestedIdx >= 0 ? requestedIdx : 0)
  }

  if (!gig) return null

  const buyer = userService.getLoggedinUser()
  const isOwnGig = Boolean(buyer?.id && buyer.id === gig.owner?.id)
  const selectedPkg = packages[selectedIdx] ?? packages[0] ?? null

  function onSelectPackage(idx) {
    setSelectedIdx(idx)
    const pkg = packages[idx]
    if (!pkg) return
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('package', String(pkg.tier || pkg.id || 'BASIC').toUpperCase())
    setSearchParams(nextParams, { replace: true })
  }

  function handleContinue() {
    if (!selectedPkg) return
    const packageValue = String(selectedPkg.tier || selectedPkg.id || 'BASIC').toUpperCase()
    navigate(`/checkout/${gig.id}?package=${encodeURIComponent(packageValue)}`, {
      state: { packageId: selectedPkg.id || packageValue },
    })
  }

  return (
    <div className="order-card">
      <PackageSelector packages={packages} selectedIdx={selectedIdx} onSelect={onSelectPackage} />

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
