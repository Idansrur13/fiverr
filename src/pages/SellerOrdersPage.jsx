import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import demoGigs from '../data/gigs.json'
import { OrderTable } from '../cmps/OrderTable'
import { userService } from '../services/user.service'
import { loadOrders } from '../store/order.actions'

const STATUS_TABS = [
  { status: 'PENDING', label: 'Pending' },
  { status: 'IN_PROGRESS', label: 'In progress' },
  { status: 'DELIVERED', label: 'Delivered' },
  { status: 'COMPLETED', label: 'Completed' },
  { status: 'CANCELLED', label: 'Cancelled' },
]

export function SellerOrdersPage() {
  const loggedinUser = userService.getLoggedinUser()
  const orders = useSelector((state) => state.orderModule.orders)
  const cachedOrdersRef = useRef(orders.filter((order) => order.seller?.id === loggedinUser.id))
  const [selectedStatus, setSelectedStatus] = useState('PENDING')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [fallbackOrders, setFallbackOrders] = useState([])
  const [isShowingDemo, setIsShowingDemo] = useState(false)

  useEffect(() => {
    let isCancelled = false

    loadOrders({ sellerId: loggedinUser.id })
      .then((loadedOrders) => {
        if (isCancelled || loadedOrders.length) return
        setFallback(loggedinUser.id)
      })
      .catch(() => {
        if (isCancelled) return
        setErrorMsg('Could not load your orders. Showing demo orders when available.')
        setFallback(loggedinUser.id)
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false)
      })

    function setFallback(sellerId) {
      const cachedOrders = cachedOrdersRef.current
      const demoOrders = cachedOrders.length ? cachedOrders : getDemoOrders(sellerId)
      setFallbackOrders(demoOrders)
      setIsShowingDemo(!cachedOrders.length && demoOrders.length > 0)
    }

    return () => {
      isCancelled = true
    }
  }, [loggedinUser.id])

  const sellerOrders = orders.filter((order) => order.seller?.id === loggedinUser.id)
  const sourceOrders = sellerOrders.length ? sellerOrders : fallbackOrders
  const sortedOrders = [...sourceOrders].sort(
    (first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
  )
  const visibleOrders = sortedOrders.filter((order) => order.status === selectedStatus)
  const selectedTab = STATUS_TABS.find((tab) => tab.status === selectedStatus)

  function getOrdersCount(status) {
    return sortedOrders.filter((order) => order.status === status).length
  }

  return (
    <section className="seller-orders-page">
      <header className="seller-orders-header">
        <h1>Manage Orders</h1>
      </header>

      <div className="seller-order-tabs" role="tablist" aria-label="Order status">
        {STATUS_TABS.map(({ status, label }) => (
          <button
            key={status}
            id={`seller-order-tab-${status.toLowerCase()}`}
            type="button"
            role="tab"
            className="seller-order-tab"
            aria-selected={status === selectedStatus}
            aria-controls="seller-orders-panel"
            onClick={() => setSelectedStatus(status)}
          >
            {label} <span className="seller-order-tab-count">{getOrdersCount(status)}</span>
          </button>
        ))}
      </div>

      {errorMsg && (
        <p className="seller-orders-error" role="alert">
          {errorMsg}
        </p>
      )}
      {isShowingDemo && (
        <p className="seller-orders-demo-note" role="status">
          Showing demo orders.
        </p>
      )}

      <section
        id="seller-orders-panel"
        className="seller-orders-panel"
        role="tabpanel"
        aria-labelledby={`seller-order-tab-${selectedStatus.toLowerCase()}`}
      >
        <h2 className="seller-orders-panel-title">{selectedTab.label} orders</h2>
        {isLoading ? (
          <p className="seller-orders-message">Loading orders...</p>
        ) : visibleOrders.length ? (
          <OrderTable orders={visibleOrders} />
        ) : (
          <p className="seller-orders-message">
            No {selectedTab.label.toLowerCase()} orders to show
          </p>
        )}
      </section>
    </section>
  )
}

function getDemoOrders(sellerId) {
  return demoGigs
    .filter((gig) => gig.owner?.id === sellerId)
    .flatMap((gig) =>
      (gig.reviews || []).map((review) => ({
        id: `demo-order-${review.id}`,
        buyer: review.by,
        seller: gig.owner,
        gig: { id: gig.id, title: gig.title, imgUrl: gig.images?.[0] },
        price: gig.price,
        status: 'COMPLETED',
        createdAt: review.createdAt - 2 * 24 * 60 * 60 * 1000,
      })),
    )
}
