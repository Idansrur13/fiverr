import { Link } from 'react-router-dom'
import { Pencil, Trash2 } from 'lucide-react'

export function SellerGigTable({ gigs, ordersCountByGig = {}, onRemoveGig }) {
  return (
    <table className="seller-gig-table">
      <thead>
        <tr>
          <th scope="col">Gig</th>
          <th scope="col" className="num-col">
            Price
          </th>
          <th scope="col" className="num-col">
            Orders
          </th>
          <th scope="col" className="actions-col">
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        {gigs.map((gig) => (
          <tr key={gig.id}>
            <td className="gig-cell">
              <div className="gig-info">
                <img src={gig.images?.[0]} alt="" />
                <Link to={`/gig/${gig.id}`} className="gig-title">
                  {gig.title}
                </Link>
              </div>
            </td>
            <td className="num-col" data-label="Price">
              ${gig.price}
            </td>
            <td className="num-col" data-label="Orders">
              {ordersCountByGig[gig.id] || 0}
            </td>
            <td className="actions-cell">
              <div className="gig-actions">
                <Link to={`/seller/gigs/${gig.id}/edit`} className="action-btn">
                  <Pencil size={16} />
                  Edit
                </Link>
                <button
                  type="button"
                  className="action-btn delete-btn"
                  onClick={() => onRemoveGig(gig)}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
