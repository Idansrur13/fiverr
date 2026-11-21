import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { OrderTable } from '../cmps/OrderTable'
import { userService } from '../services/user.service'
import { loadOrders } from '../store/order.actions'

const STATUS_TABS = [
  { status: 'ALL', label: 'All' },
  { status: 'PENDING', label: 'Pending' },
  { status: 'IN_PROGRESS', label: 'In progress' },
  { status: 'DELIVERED', label: 'Delivered' },
  { status: 'COMPLETED', label: 'Completed' },
  { status: 'CANCELLED', label: 'Cancelled' },
]

export function BuyerOrdersPage() {
  const loggedinUser = userService.getLoggedinUser()
  const orders = useSelector((state) => state.orderModule.orders)
  const [selectedStatus, setSelectedStatus] = useState('ALL')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    let isCancelled = false

    loadOrders({ buyerId: loggedinUser.id })
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

  const visibleOrders =
    selectedStatus === 'ALL' ? orders : orders.filter((order) => order.status === selectedStatus)
  const selectedTab = STATUS_TABS.find((tab) => tab.status === selectedStatus)

  function getOrdersCount(status) {
    return status === 'ALL'
      ? orders.length
      : orders.filter((order) => order.status === status).length
  }

  return (
    <section className="orders-page buyer-orders-page">
      <h1>My Orders</h1>
      <div className="status-tabs order-status-tabs" role="tablist" aria-label="Order status">
        {STATUS_TABS.map(({ status, label }) => (
          <button
            key={status}
            id={`buyer-order-tab-${status.toLowerCase()}`}
            type="button"
            role="tab"
            className="status-tab"
            aria-selected={status === selectedStatus}
            aria-controls="buyer-orders-panel"
            onClick={() => setSelectedStatus(status)}
          >
            {label} <span className="tab-count">{getOrdersCount(status)}</span>
          </button>
        ))}
      </div>

      {errorMsg && (
        <p className="orders-page-error" role="alert">
          {errorMsg}
        </p>
      )}

      <section
        id="buyer-orders-panel"
        className="orders-page-panel"
        role="tabpanel"
        aria-labelledby={`buyer-order-tab-${selectedStatus.toLowerCase()}`}
      >
        <h2 className="orders-panel-title">{selectedTab.label} orders</h2>
        {isLoading ? (
          <p className="orders-panel-message">Loading orders...</p>
        ) : visibleOrders.length ? (
          <OrderTable orders={visibleOrders} viewer="buyer" />
        ) : (
          <p className="orders-panel-message">
            No {selectedTab.label.toLowerCase()} orders to show
          </p>
        )}
      </section>
    </section>
  )
}
