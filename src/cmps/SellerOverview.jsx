import { Star } from 'lucide-react'
export function SellerOverview({owner,rating,reviewsCount}) {
    if(!owner) return null
    const {fullname,imgUrl,level} = owner
    return(
        <section className="seller-overview">
            <img src={imgUrl} alt={fullname} className="seller-overview-avatar" />
            <strong className="seller-overview-name">{fullname}</strong>
               {level && <span className="seller-overview-level">{level}</span>}
             {rating != null && (
        <span className="seller-overview-rating">
          <Star size={16} fill="currentColor" />
          <strong>{rating.toFixed(1)}</strong>
          {reviewsCount != null && <span>({reviewsCount} reviews)</span>}
        </span>
      )}
        </section>
    )}
        
                