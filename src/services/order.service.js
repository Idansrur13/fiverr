import { storageService } from './storage.service'

const STORAGE_KEY = 'orderDB'
const DAY = 24 * 60 * 60 * 1000

export const orderService = {
  query,
  add,
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

function add({
  gig,
  buyer,
  pkg = null,
  packageId = pkg?.packageId || pkg?.id || null,
  serviceFee = 0,
  total,
}) {
  const createdAt = Date.now()
  const owner = gig.owner || {}
  const price = pkg?.price ?? gig.price
  const daysToMake = pkg?.daysToMake ?? gig.daysToMake
  const order = {
    buyer: { id: buyer.id, fullname: buyer.fullname, imgUrl: buyer.imgUrl },
    seller: {
      id: owner.id || gig.ownerId,
      fullname: owner.fullname,
      imgUrl: owner.imgUrl,
    },
    gig: { id: gig.id, title: gig.title, imgUrl: gig.images?.[0] },
    package: pkg && { id: pkg.id, tier: pkg.tier, title: pkg.title },
    packageId,
    price,
    serviceFee,
    total: total ?? price + serviceFee,
    status: 'PENDING',
    createdAt,
    dueAt: createdAt + daysToMake * DAY,
  }
  return storageService.post(STORAGE_KEY, order)
}
