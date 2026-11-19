import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Home } from 'lucide-react'

import {GigGallery} from '../cmps/GigGallery'
import { SellerOverview } from '../cmps/SellerOverview'
import { AboutSeller } from '../cmps/AboutSeller'
const DEMO_GIG = {
  title: 'I will build a modern React website',
  description: 'Clean code, fast delivery, responsive design.',
  rating: 5.0,
  reviewsCount: 12,
  images: [
    'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800',
    'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=800',
    'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800',
  ],
  category: { name: 'Web Programming', parent: { name: 'Programming & Tech' } },
  owner: {
    id: 'u101',
    fullname: 'Soli Dev',
    imgUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
    level: 'Top Rated',
    country: 'Israel',
    languages: ['English', 'Hebrew'],
    responseTime: '1 hour',
    about: 'Full-stack developer specializing in React and modern web applications.',
  },
}
export function GigDetailsPage() {
  const { gigId } = useParams()
  const [gig, setGig] = useState(DEMO_GIG)
  
  if (!gig) return <p>Loading...</p>
const { title, description, category, owner, images, rating, reviewsCount } = gig
  
  return (
    <section className="gig-details-page">
      <nav className="gig-breadcrumbs">
        <Link to="/" aria-label="Home">
          <Home size={16} /> </Link>
        / <span>{category.parent.name}</span>
        / <span>{category.name}</span>
      </nav>

      <h1>{title}</h1>
      <SellerOverview owner={owner} rating={rating} reviewsCount={reviewsCount} />
      <GigGallery images={images} />

      <section className="gig-about">
  <h2>About this gig</h2>
  <p>{description}</p>
</section>
      <AboutSeller owner={owner} rating={rating} reviewsCount={reviewsCount} />
    </section>
  )
}
