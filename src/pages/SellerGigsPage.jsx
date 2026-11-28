import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Plus } from 'lucide-react'

import { SellerGigTable } from '../cmps/SellerGigTable'
import { userService } from '../services/user.service'
import { loadGigs, removeGig } from '../store/gig.actions'
import { loadOrders } from '../store/order.actions'

const STATUS_TABS = [
  { status: 'ACTIVE', label: 'Active' },
  { status: 'DRAFT', label: 'Draft' },
  { status: 'PAUSED', label: 'Paused' },
]

export function SellerGigsPage() {
  const loggedinUser = userService.getLoggedinUser()
  const gigs = useSelector((state) => state.gigModule.gigs)
  const orders = useSelector((state) => state.orderModule.orders)
  const [selectedStatus, setSelectedStatus] = useState('ACTIVE')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    let isCancelled = false

    Promise.all([loadGigs({}), loadOrders({ sellerId: loggedinUser.id }, () => !isCancelled)])
      .catch(() => {
        if (!isCancelled) setErrorMsg('Could not load your gigs, please try again')
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false)
      })

    return () => {
      isCancelled = true
    }
  }, [loggedinUser.id])

  async function onRemoveGig(gig) {
    if (!window.confirm(`Delete "${gig.title}"? This cannot be undone.`)) return

    try {
      setErrorMsg('')
      await removeGig(gig.id)
    } catch {
      setErrorMsg('Could not delete the gig, please try again')
    }
  }

  const sellerGigs = gigs.filter((gig) => gig.owner?.id === loggedinUser.id)
  const visibleGigs = sellerGigs.filter((gig) => gig.status === selectedStatus)
  const selectedTab = STATUS_TABS.find((tab) => tab.status === selectedStatus)
  const ordersCountByGig = orders.reduce((counts, order) => {
    counts[order.gig.id] = (counts[order.gig.id] || 0) + 1
    return counts
  }, {})

  function getGigsCount(status) {
    return sellerGigs.filter((gig) => gig.status === status).length
  }

  return (
    <section className="seller-gigs-page">
      <header className="seller-gigs-header">
        <h1>My Gigs</h1>
        <Link to="/seller/gigs/new" className="create-gig-btn">
          <Plus size={18} />
          Create a new gig
        </Link>
      </header>

      <div className="status-tabs" role="tablist" aria-label="Gig status">
        {STATUS_TABS.map(({ status, label }) => (
          <button
            key={status}
            id={`status-tab-${status.toLowerCase()}`}
            type="button"
            role="tab"
            className="status-tab"
            aria-selected={status === selectedStatus}
            aria-controls="seller-gigs-panel"
            onClick={() => setSelectedStatus(status)}
          >
            {label} <span className="tab-count">{getGigsCount(status)}</span>
          </button>
        ))}
      </div>

      {errorMsg && (
        <p className="seller-gigs-error" role="alert">
          {errorMsg}
        </p>
      )}

      <section
        id="seller-gigs-panel"
        className="seller-gigs-panel"
        role="tabpanel"
        aria-labelledby={`status-tab-${selectedStatus.toLowerCase()}`}
      >
        <h2 className="panel-title">{selectedTab.label} gigs</h2>
        {isLoading ? (
          <p className="panel-msg">Loading...</p>
        ) : visibleGigs.length ? (
          <SellerGigTable
            gigs={visibleGigs}
            ordersCountByGig={ordersCountByGig}
            onRemoveGig={onRemoveGig}
          />
        ) : (
          <p className="panel-msg">No {selectedTab.label.toLowerCase()} gigs to show</p>
        )}
      </section>
    </section>
  )
}
