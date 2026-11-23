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
  const loggedinUser = userService.getLoggedinUser?.() || null
  const loggedinUserId = loggedinUser?.id || ''
  const orders = useSelector((state) => state.orderModule.orders)
  const cachedOrdersRef = useRef(orders)
  const [selectedStatus, setSelectedStatus] = useState('PENDING')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [fallbackOrders, setFallbackOrders] = useState([])
  const [isShowingDemo, setIsShowingDemo] = useState(false)
  const [sellerId, setSellerId] = useState(
    loggedinUserId || getSellerIdFromOrders(orders) || getFirstDemoSellerId(),
  )

  useEffect(() => {
    cachedOrdersRef.current = orders
  }, [orders])

  useEffect(() => {
    let isCancelled = false
    const cachedOrders = cachedOrdersRef.current

    loadOrders(loggedinUserId ? { sellerId: loggedinUserId } : {})
      .then((loadedOrders) => {
        if (isCancelled) return
        const resolvedSellerId =
          loggedinUserId ||
          getSellerIdFromOrders(loadedOrders) ||
          getSellerIdFromOrders(cachedOrders) ||
          getFirstDemoSellerId()
        const matchingOrders = loadedOrders.filter((order) =>
          isOrderForSeller(order, resolvedSellerId),
        )
        const cachedMatchingOrders = cachedOrders.filter((order) =>
          isOrderForSeller(order, resolvedSellerId),
        )

        setSellerId(resolvedSellerId)
        setFallback(matchingOrders.length ? matchingOrders : cachedMatchingOrders, resolvedSellerId)
        setErrorMsg('')
      })
      .catch(() => {
        if (isCancelled) return
        const resolvedSellerId =
          loggedinUserId || getSellerIdFromOrders(cachedOrders) || getFirstDemoSellerId()
        const matchingOrders = cachedOrders.filter((order) =>
          isOrderForSeller(order, resolvedSellerId),
        )

        setSellerId(resolvedSellerId)
        setErrorMsg('Could not refresh your orders. Showing available saved or demo orders.')
        setFallback(matchingOrders, resolvedSellerId)
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false)
      })

    function setFallback(matchingOrders, fallbackSellerId) {
      if (matchingOrders.length) {
        setFallbackOrders(matchingOrders)
        setIsShowingDemo(false)
        return
      }

      const demoOrders = getDemoOrders(fallbackSellerId)
      setFallbackOrders(demoOrders)
      setIsShowingDemo(demoOrders.length > 0)
    }

    return () => {
      isCancelled = true
    }
  }, [loggedinUserId])

  const sellerOrders = orders.filter((order) => isOrderForSeller(order, sellerId))
  const sourceOrders = sellerOrders.length ? sellerOrders : fallbackOrders
  const sortedOrders = [...sourceOrders].sort(
    (first, second) => getTimestamp(second.createdAt) - getTimestamp(first.createdAt),
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

function getOrderSellerId(order) {
  return order?.sellerId || order?.seller?.id
}

function getSellerIdFromOrders(orders) {
  return getOrderSellerId(orders.find((order) => getOrderSellerId(order)))
}

function isOrderForSeller(order, sellerId) {
  return Boolean(sellerId) && getOrderSellerId(order) === sellerId
}

function getTimestamp(value) {
  const timestamp = typeof value === 'number' ? value : Date.parse(value)
  return Number.isFinite(timestamp) ? timestamp : 0
}

function getFirstDemoSellerId() {
  return demoGigs.find((gig) => gig.owner?.id)?.owner.id || ''
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
