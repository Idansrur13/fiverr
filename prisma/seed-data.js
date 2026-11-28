import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { calcOrderTotal, roundToCents } from '../shared/pricing.service.js'

const DAY = 24 * 60 * 60 * 1000

const PACKAGE_TIERS = [
  {
    tier: 'BASIC',
    title: 'Basic',
    description: 'The essentials to get started',
    priceFactor: 1,
    extraDays: 0,
    revisions: 1,
    features: ['Commercial use'],
  },
  {
    tier: 'STANDARD',
    title: 'Standard',
    description: 'More revisions and extra polish',
    priceFactor: 2,
    extraDays: 2,
    revisions: 3,
    features: ['Commercial use', 'Source files'],
  },
  {
    tier: 'PREMIUM',
    title: 'Premium',
    description: 'The full package with priority support',
    priceFactor: 3,
    extraDays: 4,
    revisions: 5,
    features: ['Commercial use', 'Source files', 'Priority support'],
  },
]

export function loadDemoGigs() {
  const fileUrl = new URL('../src/data/gigs.json', import.meta.url)
  return JSON.parse(readFileSync(fileUrl, 'utf8'))
}

// The DB uses UUIDs, but the demo data has ids like "g101".
// The same demo id always becomes the same UUID, so running the seed twice updates
// the same rows instead of creating duplicates.
export function toUuid(demoId) {
  const hex = createHash('sha1').update(`fiverr-demo:${demoId}`).digest('hex').slice(0, 32)
  const variant = ((parseInt(hex[16], 16) & 0x3) | 0x8).toString(16)
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    `5${hex.slice(13, 16)}`,
    `${variant}${hex.slice(17, 20)}`,
    hex.slice(20, 32),
  ].join('-')
}

function toSeller(owner) {
  return {
    id: toUuid(owner.id),
    username: owner.id,
    fullname: owner.fullname,
    imgUrl: owner.imgUrl,
    isSeller: true,
    level: owner.level,
  }
}

function toBuyer(reviewer) {
  return {
    id: toUuid(reviewer.id),
    username: reviewer.id,
    fullname: reviewer.fullname,
    imgUrl: reviewer.imgUrl,
    isSeller: false,
    level: 'NEW',
    country: reviewer.country,
  }
}

export function buildSeedData(demoGigs) {
  const users = new Map(demoGigs.map(({ owner }) => [owner.id, toSeller(owner)]))
  const gigs = []
  const packages = []
  const orders = []
  const reviews = []

  for (const demoGig of demoGigs) {
    const { owner } = demoGig
    const gigId = toUuid(demoGig.id)
    gigs.push({
      id: gigId,
      ownerId: toUuid(owner.id),
      categorySlug: demoGig.category,
      title: demoGig.title,
      description: demoGig.description,
      images: demoGig.images,
      tags: [],
      status: demoGig.status,
      createdAt: new Date(demoGig.createdAt),
    })

    for (const { priceFactor, extraDays, ...tierFields } of PACKAGE_TIERS) {
      packages.push({
        id: toUuid(`${demoGig.id}-${tierFields.tier}`),
        gigId,
        ...tierFields,
        price: roundToCents(demoGig.price * priceFactor),
        daysToMake: demoGig.daysToMake + extraDays,
      })
    }

    // Every review needs a completed order, made on the BASIC package
    for (const demoReview of demoGig.reviews) {
      const reviewer = demoReview.by
      users.set(reviewer.id, { ...toBuyer(reviewer), ...users.get(reviewer.id) })

      // Realistic dates: ordered, delivered on time, and reviewed a day after delivery
      const reviewedAt = demoReview.createdAt
      const deliveredAt = reviewedAt - DAY
      const createdAt = Math.max(deliveredAt - demoGig.daysToMake * DAY, demoGig.createdAt)
      const orderId = toUuid(`order-${demoReview.id}`)

      orders.push({
        id: orderId,
        buyerId: toUuid(reviewer.id),
        sellerId: toUuid(owner.id),
        gigId,
        packageId: toUuid(`${demoGig.id}-BASIC`),
        ...calcOrderTotal(demoGig.price),
        status: 'COMPLETED',
        createdAt: new Date(createdAt),
        dueAt: new Date(createdAt + demoGig.daysToMake * DAY),
        deliveredAt: new Date(deliveredAt),
      })

      reviews.push({
        id: toUuid(demoReview.id),
        orderId,
        gigId,
        reviewerId: toUuid(reviewer.id),
        rating: demoReview.rating,
        text: demoReview.txt,
        createdAt: new Date(reviewedAt),
      })
    }
  }

  return { users: [...users.values()], gigs, packages, orders, reviews }
}
