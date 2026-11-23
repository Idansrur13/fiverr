// What GET /api/gigs and GET /api/users/[id] load for every gig card
export const GIG_PREVIEW_INCLUDE = {
  owner: { select: { id: true, fullname: true, imgUrl: true, level: true } },
  category: { select: { slug: true } },
  packages: { where: { tier: 'BASIC' }, select: { price: true, daysToMake: true } },
  reviews: { select: { rating: true } },
}

// The same shape GigPreview already uses with the demo data, so the frontend doesn't change
export function toGigPreview(gig) {
  const [basicPackage] = gig.packages
  return {
    id: gig.id,
    title: gig.title,
    images: gig.images,
    category: gig.category.slug,
    price: basicPackage ? Number(basicPackage.price) : null,
    daysToMake: basicPackage ? basicPackage.daysToMake : null,
    owner: gig.owner,
    reviews: gig.reviews,
  }
}
