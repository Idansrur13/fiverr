import { describe, it, expect, afterAll } from 'vitest'
import handler from '../../api/health.js'
import { prisma } from '../../api/_lib/prisma.js'
import { createMockReq, createMockRes } from './helpers.js'

afterAll(() => prisma.$disconnect())

describe('GET /api/health', () => {
  it('responds ok when the database is reachable', async () => {
    const res = createMockRes()

    await handler(createMockReq(), res)

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ status: 'ok' })
  })
})
