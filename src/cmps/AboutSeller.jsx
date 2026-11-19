import { Star } from 'lucide-react'
export function AboutSeller({ owner, rating, reviewsCount }) {
  if (!owner) return null

    const { fullname, imgUrl, level, country, languages, responseTime, about } = owner
  return (
    <section className="about-seller">
      <h2>Get to know {fullname}</h2>

     <div className="about-seller-info">
        <img src={imgUrl} alt={fullname} className="about-seller-avatar" />
        <div className="about-seller-header">
          <h3>{fullname}</h3>
          {level && <span className="about-seller-level">{level}</span>}
          {rating != null && (
            <span className="about-seller-rating">
              <Star size={16} fill="currentColor" />
              <strong>{rating.toFixed(1)}</strong>
              {reviewsCount != null && <span>({reviewsCount})</span>}
            </span>
          )}
        </div>
      </div>
<div className="about-seller-card">
        <div className="about-seller-details">
          {country && (
            <div className="about-seller-item">
              <span className="detail-label">From</span>
              <strong className="detail-value">{country}</strong>
            </div>
          )}
          {responseTime && (
            <div className="about-seller-item">
              <span className="detail-label">Avg. response time</span>
              <strong className="detail-value">{responseTime}</strong>
            </div>
          )}
          {languages?.length > 0 && (
            <div className="about-seller-item">
              <span className="detail-label">Languages</span>
              <strong className="detail-value">{languages.join(', ')}</strong>
            </div>
          )}
        </div>

        {about && <p className="about-seller-bio">{about}</p>}
      </div>
    </section>
  )
}
