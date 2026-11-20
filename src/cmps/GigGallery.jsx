import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function GigGallery({ images = [] }) {
  const [activeIdx, setActiveIdx] = useState(0)
  if (!images.length) return <p>No images to display</p> //put a loader here

  function handlePrev() {
    setActiveIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  function handleNext() {
    setActiveIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }
  return (
    <div className="gig-gallery">
      <div className="gig-gallery-main">
        <img src={images[activeIdx]} alt={`Gig preview ${activeIdx + 1}`} />

        {images.length > 1 && (
          <>
            <button type="button" onClick={handlePrev} aria-label="Previous image">
              <ChevronLeft size={20} />
            </button>
            <button type="button" onClick={handleNext} aria-label="Next image">
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>
      <div className="gig-gallery-thumbs">
        {images.map((imgUrl, idx) => (
          <button
            key={imgUrl + idx}
            type="button"
            className={idx === activeIdx ? 'active' : ''}
            onClick={() => setActiveIdx(idx)}
          >
            <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} />
          </button>
        ))}
      </div>
    </div>
  )
}
