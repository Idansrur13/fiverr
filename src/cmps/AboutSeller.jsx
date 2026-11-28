import { Link } from 'react-router-dom'
import { SellerBadge } from './SellerBadge'

function getText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function getLanguages(value) {
  if (!Array.isArray(value)) return ''

  return value
    .map((language) => (typeof language === 'string' ? language : language?.name))
    .filter((language) => typeof language === 'string')
    .map((language) => language.trim())
    .filter(Boolean)
    .join(', ')
}

function getDate(value, options) {
  if (typeof value !== 'string' && typeof value !== 'number' && !(value instanceof Date)) {
    return ''
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('en-US', options).format(date)
}

export function AboutSeller({ owner, rating, reviewsCount }) {
  if (!owner) return null

  const { id, fullname, imgUrl, level } = owner
  const detailItems = [
    { label: 'From', value: getText(owner.country) },
    {
      label: 'Member since',
      value: getDate(owner.createdAt, { month: 'long', year: 'numeric' }),
    },
    { label: 'Languages', value: getLanguages(owner.languages) },
    { label: 'Avg. response time', value: getText(owner.responseTime) },
    {
      label: 'Last delivery',
      value: getDate(owner.lastDelivery ?? owner.lastDeliveryAt, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    },
  ].filter((item) => item.value)
  const about = getText(owner.about)
  const hasDetails = detailItems.length > 0 || about

  return (
    <section className="about-seller">
      <h2>Get to know {fullname}</h2>

      <div className="about-seller-info">
        {imgUrl && <img src={imgUrl} alt={fullname || 'Seller'} className="about-seller-avatar" />}
        <div className="about-seller-header">
          <h3>
            <Link to={`/user/${id}`} className="about-seller-link">
              {fullname}
            </Link>
          </h3>
          <SellerBadge level={level} rating={rating} reviewsCount={reviewsCount} />
        </div>
        <button className="about-seller-contact" type="button">
          Contact me
        </button>
      </div>

      {hasDetails && (
        <div className={`about-seller-card${about && detailItems.length ? ' has-about' : ''}`}>
          {detailItems.length > 0 && (
            <div className="about-seller-details">
              {detailItems.map(({ label, value }) => (
                <div className="about-seller-item" key={label}>
                  <span className="detail-label">{label}</span>
                  <strong className="detail-value">{value}</strong>
                </div>
              ))}
            </div>
          )}

          {about && <p className="about-seller-bio">{about}</p>}
        </div>
      )}
    </section>
  )
}
