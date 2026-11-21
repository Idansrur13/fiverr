import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Check, Clock } from 'lucide-react'
import { addOrder } from '../store/order.actions'

export function OrderCard({ gig }) {
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [isCreating, setIsCreating] = useState(false)
  const [statusMsg, setStatusMsg] = useState(null)
  const loggedInUser = useSelector((state) => state.userModule?.user)

  if (!gig) return null

  const activePkg = gig.packages?.length > 0 ? gig.packages[selectedIdx] : gig
  const features = activePkg.features || []

  async function handleContinue() {
    setIsCreating(true)
    setStatusMsg(null)
    try {
      const buyer = loggedInUser || { id: 'u-guest', fullname: 'Guest Buyer', imgUrl: '' }
      const gigToOrder = { ...gig, price: activePkg.price, daysToMake: activePkg.daysToMake }
      await addOrder({ gig: gigToOrder, buyer })
      setStatusMsg({ type: 'success', text: 'Order created successfully!' })
    } catch {
      setStatusMsg({ type: 'error', text: 'Failed to create order. Please try again.' })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="order-card">
      <div className="order-card-header">
        <span className="order-card-price">${activePkg.price}</span>
      </div>

      <div className="order-card-time">
        <Clock size={16} />
        <span>{activePkg.daysToMake}-day delivery</span>
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

      <button
        type="button"
        className="order-card-continue-btn"
        onClick={handleContinue}
        disabled={isCreating}
      >
        Continue
      </button>

      {statusMsg && (
        <p className={`order-card-feedback ${statusMsg.type}`} role="status">
          {statusMsg.text}
        </p>
      )}
    </div>
  )
}
