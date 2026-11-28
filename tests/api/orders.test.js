import { randomUUID } from 'node:crypto'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { ORDER_INCLUDE } from '../../api/_lib/order-response.js'
import { prisma } from '../../api/_lib/prisma.js'
import { seed } from '../../prisma/seed.js'
import { loadDemoGigs, toUuid } from '../../prisma/seed-data.js'
import { calcOrderTotal } from '../../shared/pricing.service.js'
import { clearSeededTables, createMockReq, createMockRes } from './helpers.js'
import ordersHandler from '../../api/orders/index.js'
import orderHandler from '../../api/orders/[id].js'
import updateStatusHandler from '../../api/orders/[id]/status.js'

const { getUser } = vi.hoisted(() => ({ getUser: vi.fn() }))

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({ auth: { getUser } }),
}))

const demoGigs = loadDemoGigs()
const GIG_ID = toUuid('g101')
const SELLER_ID = toUuid('u101')
const BUYER_ID = toUuid('u201')
const PACKAGE_ID = toUuid('g101-BASIC')
const TOKEN = 'orders-test-token'
const createdUserIds = new Set()

function signInAs(id) {
  getUser.mockImplementation(async (token) =>
    token === TOKEN
      ? {
          data: {
            user: {
              id,
              email: `${id.slice(0, 8)}@orders.test`,
              user_metadata: { fullname: `User ${id.slice(0, 8)}` },
            },
          },
          error: null,
        }
      : { data: { user: null }, error: new Error('Invalid JWT') },
  )
}

async function callApi(handler, { method = 'GET', query = {}, body, token = TOKEN } = {}) {
  const res = createMockRes()
  const headers = token ? { authorization: `Bearer ${token}` } : {}
  await handler(createMockReq({ method, query, body, headers }), res)
  return res
}

async function createOrder({ buyerId = BUYER_ID, status = 'PENDING' } = {}) {
  const pkg = await prisma.package.findUnique({ where: { id: PACKAGE_ID } })
  const totals = calcOrderTotal(Number(pkg.price))
  const order = await prisma.order.create({
    data: {
      buyerId,
      sellerId: SELLER_ID,
      gigId: GIG_ID,
      packageId: PACKAGE_ID,
      ...totals,
      status,
      dueAt: new Date(Date.now() + pkg.daysToMake * 24 * 60 * 60 * 1000),
    },
    include: ORDER_INCLUDE,
  })
  return order
}

beforeAll(async () => {
  await clearSeededTables(prisma)
  await seed(prisma, demoGigs)
})

beforeEach(() => {
  getUser.mockReset()
  signInAs(BUYER_ID)
})

afterAll(async () => {
  await clearSeededTables(prisma)
  if (createdUserIds.size) {
    await prisma.user.deleteMany({ where: { id: { in: [...createdUserIds] } } })
  }
  await prisma.$disconnect()
})

describe('/api/orders', () => {
  it('returns 401 without a token', async () => {
    const [postRes, getRes] = await Promise.all([
      callApi(ordersHandler, {
        method: 'POST',
        body: { gigId: GIG_ID, packageId: PACKAGE_ID },
        token: null,
      }),
      callApi(ordersHandler, { token: null }),
    ])

    expect(postRes.statusCode).toBe(401)
    expect(getRes.statusCode).toBe(401)
  })

  it('creates an order with the package price, service fee and total', async () => {
    const res = await callApi(ordersHandler, {
      method: 'POST',
      body: { gigId: GIG_ID, packageId: PACKAGE_ID },
    })
    const pkg = await prisma.package.findUnique({ where: { id: PACKAGE_ID } })

    expect(res.statusCode).toBe(201)
    expect(res.body).toMatchObject({
      buyer: { id: BUYER_ID },
      seller: { id: SELLER_ID },
      gig: { id: GIG_ID, title: demoGigs.find((gig) => gig.id === 'g101').title },
      package: { id: PACKAGE_ID, tier: 'BASIC' },
      ...calcOrderTotal(Number(pkg.price)),
      status: 'PENDING',
    })
    expect(new Date(res.body.dueAt).getTime()).toBeGreaterThan(Date.now())
  })

  it('ignores a price sent by the client', async () => {
    const res = await callApi(ordersHandler, {
      method: 'POST',
      body: {
        gigId: GIG_ID,
        packageId: PACKAGE_ID,
        price: 0.01,
        serviceFee: 0,
        total: 0.01,
      },
    })
    const pkg = await prisma.package.findUnique({ where: { id: PACKAGE_ID } })

    expect(res.statusCode).toBe(201)
    expect(res.body.price).toBe(Number(pkg.price))
    expect(res.body.serviceFee).toBe(calcOrderTotal(Number(pkg.price)).serviceFee)
    expect(res.body.total).toBe(calcOrderTotal(Number(pkg.price)).total)
  })

  it('rejects ordering your own gig', async () => {
    signInAs(SELLER_ID)

    const res = await callApi(ordersHandler, {
      method: 'POST',
      body: { gigId: GIG_ID, packageId: PACKAGE_ID },
    })

    expect(res.statusCode).toBe(400)
    expect(res.body).toEqual({ error: 'You cannot order your own gig' })
  })

  it('lists only the orders of the logged in buyer', async () => {
    const res = await callApi(ordersHandler, { query: { role: 'buyer' } })
    const expected = await prisma.order.findMany({
      where: { buyerId: BUYER_ID },
      orderBy: { createdAt: 'desc' },
    })

    expect(res.statusCode).toBe(200)
    expect(res.body.map((order) => order.id)).toEqual(expected.map((order) => order.id))
    expect(res.body.every((order) => order.buyer.id === BUYER_ID)).toBe(true)
  })

  it('lists only the orders of the logged in seller', async () => {
    signInAs(SELLER_ID)

    const res = await callApi(ordersHandler, { query: { role: 'seller' } })
    const expected = await prisma.order.findMany({
      where: { sellerId: SELLER_ID },
      orderBy: { createdAt: 'desc' },
    })

    expect(res.statusCode).toBe(200)
    expect(res.body.map((order) => order.id)).toEqual(expected.map((order) => order.id))
    expect(res.body.every((order) => order.seller.id === SELLER_ID)).toBe(true)
  })

  it('returns 403 for an order of other users', async () => {
    const order = await createOrder()
    const outsiderId = randomUUID()
    createdUserIds.add(outsiderId)
    signInAs(outsiderId)

    const res = await callApi(orderHandler, { query: { id: order.id } })

    expect(res.statusCode).toBe(403)
    expect(res.body).toEqual({ error: 'You are not allowed to view this order' })
  })

  it('lets the seller move an order to the next status', async () => {
    const order = await createOrder()
    signInAs(SELLER_ID)

    const res = await callApi(updateStatusHandler, {
      method: 'PATCH',
      query: { id: order.id },
      body: { status: 'IN_PROGRESS' },
    })

    expect(res.statusCode).toBe(200)
    expect(res.body.status).toBe('IN_PROGRESS')
    expect((await prisma.order.findUnique({ where: { id: order.id } })).status).toBe('IN_PROGRESS')
  })

  it('rejects an invalid status transition', async () => {
    const order = await createOrder()
    signInAs(SELLER_ID)

    const res = await callApi(updateStatusHandler, {
      method: 'PATCH',
      query: { id: order.id },
      body: { status: 'COMPLETED' },
    })

    expect(res.statusCode).toBe(400)
    expect(res.body).toEqual({
      error: 'Cannot change order status from PENDING to COMPLETED',
    })
  })

  it('returns a conflict when the order status changes concurrently', async () => {
    const order = await createOrder()
    signInAs(SELLER_ID)
    const originalUpdateMany = prisma.order.updateMany
    const updateManySpy = vi.spyOn(prisma.order, 'updateMany').mockResolvedValue({ count: 0 })

    try {
      const res = await callApi(updateStatusHandler, {
        method: 'PATCH',
        query: { id: order.id },
        body: { status: 'IN_PROGRESS' },
      })

      expect(res.statusCode).toBe(409)
      expect(res.body).toEqual({ error: 'Order status changed by another request' })
      expect(updateManySpy).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: order.id, status: 'PENDING' } }),
      )
    } finally {
      updateManySpy.mockRestore()
      prisma.order.updateMany = originalUpdateMany
    }
  })

  it('rejects a status change by the buyer', async () => {
    const order = await createOrder()

    const res = await callApi(updateStatusHandler, {
      method: 'PATCH',
      query: { id: order.id },
      body: { status: 'IN_PROGRESS' },
    })

    expect(res.statusCode).toBe(403)
  })

  it('saves deliveredAt when the order is delivered', async () => {
    const order = await createOrder({ status: 'IN_PROGRESS' })
    signInAs(SELLER_ID)

    const res = await callApi(updateStatusHandler, {
      method: 'PATCH',
      query: { id: order.id },
      body: { status: 'DELIVERED' },
    })
    const savedOrder = await prisma.order.findUnique({ where: { id: order.id } })

    expect(res.statusCode).toBe(200)
    expect(res.body.status).toBe('DELIVERED')
    expect(res.body.deliveredAt).toBeTruthy()
    expect(savedOrder.deliveredAt).toBeInstanceOf(Date)
  })
})
