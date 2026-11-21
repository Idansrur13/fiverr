import { storageService } from './storage.service'

const STORAGE_KEY = 'orderDB'
const DAY = 24 * 60 * 60 * 1000
const SERVICE_FEE_RATE = 0.055

export const orderService = {
  query,
  add,
}

export function calcOrderTotal(price) {
  const roundedPrice = roundToCents(price)
  const serviceFee = roundToCents(roundedPrice * SERVICE_FEE_RATE)

  return {
    price: roundedPrice,
    serviceFee,
    total: roundToCents(roundedPrice + serviceFee),
  }
}

async function query({ buyerId, sellerId, status } = {}) {
  const orders = await storageService.query(STORAGE_KEY)
  return orders
    .filter(
      (order) =>
        (!buyerId || order.buyer.id === buyerId) &&
        (!sellerId || order.seller.id === sellerId) &&
        (!status || order.status === status),
    )
    .sort((a, b) => b.createdAt - a.createdAt)
}

function add({ gig, buyer, pkg = null, serviceFee = 0, total }) {
  const createdAt = Date.now()
  const { price, daysToMake } = pkg || gig
  const orderTotal = total == null ? calcOrderTotal(price) : { price, serviceFee, total }
  const order = {
    buyer: { id: buyer.id, fullname: buyer.fullname, imgUrl: buyer.imgUrl },
    seller: { id: gig.owner.id, fullname: gig.owner.fullname, imgUrl: gig.owner.imgUrl },
    gig: { id: gig.id, title: gig.title, imgUrl: gig.images[0] },
    package: pkg && { id: pkg.id, tier: pkg.tier, title: pkg.title },
    ...orderTotal,
    packageId: pkg?.packageId || pkg?.id || null,
    status: 'PENDING',
    createdAt,
    dueAt: createdAt + daysToMake * DAY,
  }
  return storageService.post(STORAGE_KEY, order)
}

function roundToCents(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100
}
