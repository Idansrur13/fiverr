import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
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
  const [selectedStatus, setSelectedStatus] = useState('PENDING')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    let isCancelled = false

    loadOrders({ sellerId: loggedinUser.id })
      .catch(() => {
        if (!isCancelled) setErrorMsg('Could not load your orders. Please try again.')
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false)
      })

    return () => {
      isCancelled = true
    }
  }, [loggedinUser.id])

  const sellerOrders = orders.filter((order) => order.seller?.id === loggedinUser.id)
  const sortedOrders = [...sellerOrders].sort(
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
