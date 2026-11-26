export const ORDER_INCLUDE = {
  buyer: { select: { id: true, fullname: true, imgUrl: true } },
  seller: { select: { id: true, fullname: true, imgUrl: true } },
  gig: { select: { id: true, title: true, images: true } },
  package: {
    select: {
      id: true,
      tier: true,
      title: true,
      description: true,
      price: true,
      daysToMake: true,
      revisions: true,
      features: true,
    },
  },
}

export function toOrderResponse(order) {
  return {
    ...order,
    price: Number(order.price),
    serviceFee: Number(order.serviceFee),
    total: Number(order.total),
    buyer: order.buyer,
    seller: order.seller,
    gig: {
      id: order.gig.id,
      title: order.gig.title,
      imgUrl: order.gig.images[0] || '',
    },
    package: {
      ...order.package,
      price: Number(order.package.price),
    },
  }
}
