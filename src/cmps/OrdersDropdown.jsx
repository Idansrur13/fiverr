import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { userService } from '../services/user.service'
import { loadBuyerOrders } from '../store/order.actions'

const STATUS_LABELS = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In progress',
  DELIVERED: 'Delivered',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

export function OrdersDropdown() {
  const buyerOrders = useSelector((storeState) => storeState.orderModule.buyerOrders)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const dropdownRef = useRef(null)
  const btnRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return

    function onMouseDown(ev) {
      if (!dropdownRef.current?.contains(ev.target)) setIsOpen(false)
    }
    function onKeyDown(ev) {
      if (ev.key !== 'Escape') return
      setIsOpen(false)
      btnRef.current?.focus()
    }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen])

  async function onToggle() {
    if (isOpen) {
      setIsOpen(false)
      return
    }
    setIsOpen(true)
    setIsLoading(true)
    setErrorMsg('')
    try {
      await loadBuyerOrders(userService.getLoggedinUser().id)
    } catch {
      setErrorMsg('Could not load your orders. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  function closeDropdown() {
    setIsOpen(false)
  }

  function renderContent() {
    if (errorMsg) {
      return (
        <p className="orders-dropdown-message" role="alert">
          {errorMsg}
        </p>
      )
    }
    if (isLoading && !buyerOrders.length) {
      return <p className="orders-dropdown-message">Loading orders...</p>
    }
    if (!buyerOrders.length) {
      return <p className="orders-dropdown-message">No orders yet</p>
    }
    return (
      <ul className="orders-dropdown-list">
        {buyerOrders.map((order) => (
          <li key={order.id}>
            <Link
              to={`/orders/${order.id}`}
              className="orders-dropdown-item"
              onClick={closeDropdown}
            >
              <img src={order.gig.imgUrl} alt="" className="orders-dropdown-img" />
              <div className="orders-dropdown-info">
                <p className="orders-dropdown-gig-title">{order.gig.title}</p>
                <div className="orders-dropdown-meta">
                  <span className="orders-dropdown-price">
                    {formatPrice(order.total ?? order.price)}
                  </span>
                  <span className="orders-dropdown-status" data-status={order.status}>
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="orders-dropdown" ref={dropdownRef}>
      <button
        type="button"
        className="orders-dropdown-btn"
        ref={btnRef}
        aria-expanded={isOpen}
        aria-controls="orders-dropdown-panel"
        onClick={onToggle}
      >
        Orders
      </button>
      {isOpen && (
        <section
          id="orders-dropdown-panel"
          className="orders-dropdown-panel"
          aria-label="Your orders"
        >
          {renderContent()}
          <Link to="/orders" className="orders-dropdown-all" onClick={closeDropdown}>
            View all orders
          </Link>
        </section>
      )}
    </div>
  )
}

function formatPrice(price) {
  const amount = Number(price)
  return Number.isFinite(amount) ? `$${amount.toFixed(2)}` : ''
}
