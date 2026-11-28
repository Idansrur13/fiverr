import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const SWIPE_MIN_DISTANCE = 40

export function ImgCarousel({ images = [], alt = '', linkTo }) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const touchStartX = useRef(null)
  const isSwiping = useRef(false)
  const hasManyImages = images.length > 1
  const lastIdx = images.length - 1

  // Like Fiverr, no loop: the carousel stops at the first and the last image
  function showImage(idx) {
    setCurrentIdx(Math.min(Math.max(idx, 0), lastIdx))
  }

  function onControlClick(ev, idx) {
    ev.stopPropagation()
    showImage(idx)
  }

  function onTouchStart(ev) {
    // A real swipe sends no click, so the flag must be reset at every new touch
    isSwiping.current = false
    touchStartX.current = ev.touches[0].clientX
  }

  function onTouchEnd(ev) {
    if (touchStartX.current === null) return
    const distance = ev.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (!hasManyImages || Math.abs(distance) < SWIPE_MIN_DISTANCE) return
    // Still a swipe at the edge, so it doesn't open the gig even though the image stays
    isSwiping.current = true
    showImage(distance < 0 ? currentIdx + 1 : currentIdx - 1)
  }

  function onClickCapture(ev) {
    if (!isSwiping.current) return
    isSwiping.current = false
    ev.preventDefault()
    ev.stopPropagation()
  }

  return (
    <div
      className="img-carousel"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onClickCapture={onClickCapture}
    >
      {linkTo ? (
        <Link to={linkTo} className="img-carousel-link">
          <img className="img-carousel-img" src={images[currentIdx]} alt={alt} />
        </Link>
      ) : (
        <img className="img-carousel-img" src={images[currentIdx]} alt={alt} />
      )}

      {hasManyImages && (
        <>
          {currentIdx > 0 && (
            <button
              type="button"
              className="img-carousel-arrow prev"
              aria-label="Previous image"
              onClick={(ev) => onControlClick(ev, currentIdx - 1)}
            >
              <ChevronLeft size={18} />
            </button>
          )}
          {currentIdx < lastIdx && (
            <button
              type="button"
              className="img-carousel-arrow next"
              aria-label="Next image"
              onClick={(ev) => onControlClick(ev, currentIdx + 1)}
            >
              <ChevronRight size={18} />
            </button>
          )}
          <div className="img-carousel-dots">
            {images.map((image, idx) => (
              <button
                key={image}
                type="button"
                className={`img-carousel-dot ${idx === currentIdx ? 'active' : ''}`}
                aria-label={`Show image ${idx + 1}`}
                aria-current={idx === currentIdx ? 'true' : undefined}
                onClick={(ev) => onControlClick(ev, idx)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
