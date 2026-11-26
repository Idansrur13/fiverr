import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { OrderList } from '../cmps/OrderList'
import { userService } from '../services/user.service'
import { loadOrders } from '../store/order.actions'

const STATUS_TABS = [
  { status: 'ACTIVE', label: 'Active' },
  { status: 'DELIVERED', label: 'Delivered' },
  { status: 'COMPLETED', label: 'Completed' },
  { status: 'CANCELLED', label: 'Cancelled' },
  { status: 'ALL', label: 'All' },
]

function getOrderUserId(order, role) {
  return order[`${role}Id`] || order[role]?.id
}

function getTimestamp(value) {
  const timestamp = new Date(value).getTime()
  return Number.isNaN(timestamp) ? 0 : timestamp
}

export function BuyerOrdersPage() {
  const loggedinUser = userService.getLoggedinUser()
  const orders = useSelector((state) => state.orderModule.orders)
  const [selectedStatus, setSelectedStatus] = useState('ACTIVE')
  const [loadState, setLoadState] = useState({
    userId: null,
    isLoading: true,
    error: '',
  })

  useEffect(() => {
    let isCancelled = false

    loadOrders({ buyerId: loggedinUser.id })
      .then(() => {
        if (!isCancelled) setLoadState({ userId: loggedinUser.id, isLoading: false, error: '' })
      })
      .catch(() => {
        if (!isCancelled) {
          setLoadState({
            userId: loggedinUser.id,
            isLoading: false,
            error: 'Could not load your orders. Please try again.',
          })
        }
      })

    return () => {
      isCancelled = true
    }
  }, [loggedinUser.id])

  const isLoading = loadState.userId !== loggedinUser.id || loadState.isLoading
  const errorMsg = loadState.userId === loggedinUser.id ? loadState.error : ''
  const buyerOrders = orders
    .filter((order) => getOrderUserId(order, 'buyer') === loggedinUser.id)
    .sort((first, second) => getTimestamp(second.createdAt) - getTimestamp(first.createdAt))
  const visibleOrders = buyerOrders.filter((order) => {
    if (selectedStatus === 'ACTIVE') return ['PENDING', 'IN_PROGRESS'].includes(order.status)
    return selectedStatus === 'ALL' || order.status === selectedStatus
  })
  const selectedTab = STATUS_TABS.find((tab) => tab.status === selectedStatus)

  function getOrdersCount(status) {
    if (status === 'ACTIVE') {
      return buyerOrders.filter((order) => ['PENDING', 'IN_PROGRESS'].includes(order.status)).length
    }
    return status === 'ALL'
      ? buyerOrders.length
      : buyerOrders.filter((order) => order.status === status).length
  }

  return (
    <section className="orders-page buyer-orders-page">
      <header className="buyer-orders-header">
        <h1>My Orders</h1>
      </header>

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
          <p className="orders-panel-message" role="status">
            Loading orders...
          </p>
        ) : visibleOrders.length ? (
          <OrderList orders={visibleOrders} />
        ) : (
          <p className="orders-panel-message">
            No {selectedTab.label.toLowerCase()} orders to show
          </p>
        )}
      </section>
    </section>
  )
}
