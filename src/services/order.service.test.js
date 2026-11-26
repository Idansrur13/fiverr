import { beforeEach, describe, expect, it } from 'vitest'
import { getNextStatuses, isValidStatusTransition, orderService } from './order.service'
import { storageService } from './storage.service'

const buyer = { id: 'buyer-1', fullname: 'Buyer' }
const seller = { id: 'seller-1', fullname: 'Seller' }
const gig = {
  id: 'local-gig-1',
  title: 'Local gig',
  images: ['gig.jpg'],
  price: 80,
  daysToMake: 4,
  owner: seller,
}
const pkg = {
  id: 'local-package-1',
  tier: 'BASIC',
  title: 'Basic',
  price: 100,
  daysToMake: 2,
}

describe('orderService', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('uses the shared legal order status transitions', () => {
    expect(getNextStatuses('PENDING')).toEqual(['IN_PROGRESS', 'CANCELLED'])
    expect(getNextStatuses('IN_PROGRESS')).toEqual(['DELIVERED'])
    expect(getNextStatuses('DELIVERED')).toEqual(['COMPLETED'])
    expect(getNextStatuses('COMPLETED')).toEqual([])
    expect(getNextStatuses('CANCELLED')).toEqual([])
    expect(isValidStatusTransition('PENDING', 'IN_PROGRESS')).toBe(true)
    expect(isValidStatusTransition('PENDING', 'COMPLETED')).toBe(false)
  })

  it('queries local orders by buyer, seller and status', async () => {
    await storageService.post('orderDB', {
      id: 'buyer-order',
      buyer,
      seller,
      status: 'PENDING',
      createdAt: 100,
    })
    await storageService.post('orderDB', {
      id: 'seller-order',
      buyer: { id: 'buyer-2' },
      seller,
      status: 'COMPLETED',
      createdAt: 200,
    })
    await storageService.post('orderDB', {
      id: 'other-order',
      buyer: { id: 'buyer-2' },
      seller: { id: 'seller-2' },
      status: 'PENDING',
      createdAt: 300,
    })

    await expect(
      orderService.query({ buyerId: buyer.id, status: 'PENDING' }),
    ).resolves.toMatchObject([{ buyer, status: 'PENDING' }])
    await expect(orderService.query({ sellerId: seller.id })).resolves.toMatchObject([
      { id: expect.any(String), status: 'COMPLETED' },
      { id: expect.any(String), status: 'PENDING' },
    ])
  })

  it('creates an order in local storage using local gig and package ids', async () => {
    const order = await orderService.add({ gig, buyer, pkg })
    const storedOrders = await storageService.query('orderDB')

    expect(order).toMatchObject({
      buyer,
      buyerId: buyer.id,
      seller,
      sellerId: seller.id,
      gig: { id: gig.id, title: gig.title, imgUrl: 'gig.jpg' },
      gigId: gig.id,
      package: pkg,
      packageId: pkg.id,
      price: 100,
      serviceFee: 5.5,
      total: 105.5,
      status: 'PENDING',
    })
    expect(order.id).toBeTruthy()
    expect(order.dueAt).toBeGreaterThan(order.createdAt)
    expect(storedOrders).toContainEqual(order)
  })

  it('creates an order using the gig price when the gig has no package', async () => {
    const order = await orderService.add({ gig, buyer })

    expect(order).toMatchObject({
      gigId: gig.id,
      package: null,
      packageId: undefined,
      price: 80,
      serviceFee: 4.4,
      total: 84.4,
    })
  })

  it('gets an order from local storage by id', async () => {
    const savedOrder = await storageService.post('orderDB', { status: 'PENDING' })

    await expect(orderService.getById(savedOrder.id)).resolves.toEqual(savedOrder)
  })

  it('updates and saves a legal status transition locally', async () => {
    const savedOrder = await storageService.post('orderDB', { status: 'IN_PROGRESS' })

    const updatedOrder = await orderService.updateStatus(savedOrder.id, 'DELIVERED')
    const storedOrder = await storageService.get('orderDB', savedOrder.id)

    expect(updatedOrder).toMatchObject({ id: savedOrder.id, status: 'DELIVERED' })
    expect(updatedOrder.deliveredAt).toBeGreaterThan(0)
    expect(storedOrder).toEqual(updatedOrder)
  })

  it('rejects an invalid status transition without changing local storage', async () => {
    const savedOrder = await storageService.post('orderDB', { status: 'PENDING' })

    await expect(orderService.updateStatus(savedOrder.id, 'COMPLETED')).rejects.toThrow(
      'Cannot change order status from PENDING to COMPLETED',
    )
    await expect(storageService.get('orderDB', savedOrder.id)).resolves.toEqual(savedOrder)
  })
})
