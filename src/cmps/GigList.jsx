import { GigPreview } from './GigPreview'

export function GigList({ gigs }) {
  if (!gigs.length) {
    return (
      <div className="gig-list-empty">
        <h3>No services found</h3>
        <p>Try a different search or category.</p>
      </div>
    )
  }

  return (
    <ul className="gig-list">
      {gigs.map((gig) => (
        <li key={gig.id}>
          <GigPreview gig={gig} />
        </li>
      ))}
    </ul>
  )
}
