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

function add({ gig, buyer }) {
  const createdAt = Date.now()
  const order = {
    buyer: { id: buyer.id, fullname: buyer.fullname, imgUrl: buyer.imgUrl },
    seller: { id: gig.owner.id, fullname: gig.owner.fullname, imgUrl: gig.owner.imgUrl },
    gig: { id: gig.id, title: gig.title, imgUrl: gig.images[0] },
    price: gig.price,
    status: 'PENDING',
    createdAt,
    dueAt: createdAt + gig.daysToMake * DAY,
  }
  return storageService.post(STORAGE_KEY, order)
}
