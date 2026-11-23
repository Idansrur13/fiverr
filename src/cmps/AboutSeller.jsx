import { Link } from 'react-router-dom'
import { SellerBadge } from './SellerBadge'

export function AboutSeller({ owner, rating, reviewsCount }) {
  if (!owner) return null

  const { id, fullname, imgUrl, level, country, languages, responseTime, about } = owner
  const hasDetails = country || (languages && languages.length > 0) || responseTime || about

  return (
    <section className="about-seller">
      <h2>Get to know {fullname}</h2>

      <div className="about-seller-info">
        <img src={imgUrl} alt={fullname} className="about-seller-avatar" />
        <div className="about-seller-header">
          <h3>
            <Link to={`/user/${id}`} className="about-seller-link">
              {fullname}
            </Link>
          </h3>
          <SellerBadge level={level} rating={rating} reviewsCount={reviewsCount} />
        </div>
      </div>

      {hasDetails && (
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
      )}
    </section>
  )
}
