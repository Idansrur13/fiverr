import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Heart } from 'lucide-react'
import { LoginModal } from './LoginModal'
import { toggleWishlist } from '../store/wishlist.actions'
import { userService } from '../services/user.service'

export function WishlistButton({ gigId }) {
  const isSaved = useSelector((storeState) => storeState.wishlistModule.gigIds.includes(gigId))
  const [isLoginOpen, setIsLoginOpen] = useState(false)

  function onToggle(ev) {
    // The heart sits on a gig card, so a click must never open the gig
    ev.preventDefault()
    ev.stopPropagation()

    if (!userService.getLoggedinUser()) {
      setIsLoginOpen(true)
      return
    }
    // The store changes only after a successful save, so on an error the heart stays as it was
    toggleWishlist(gigId).catch(() => {})
  }

  return (
    <>
      <button
        type="button"
        className={`wishlist-button ${isSaved ? 'saved' : ''}`}
        aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
        aria-pressed={isSaved}
        onClick={onToggle}
      >
        <Heart size={18} aria-hidden="true" />
      </button>
      {isLoginOpen && <LoginModal onClose={() => setIsLoginOpen(false)} />}
    </>
  )
}
