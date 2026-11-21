import { SellerBadge } from './SellerBadge'

export function SellerOverview({ owner, rating, reviewsCount }) {
  if (!owner) return null
  const { fullname, imgUrl, level } = owner
  return (
    <section className="seller-overview">
      <img src={imgUrl} alt={fullname} className="seller-overview-avatar" />
      <div className="seller-overview-info">
        <strong className="seller-overview-name">{fullname}</strong>
        <SellerBadge level={level} rating={rating} reviewsCount={reviewsCount} />
      </div>
    </section>
  )
}
