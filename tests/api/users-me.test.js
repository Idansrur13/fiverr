import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest'
import { randomUUID } from 'node:crypto'
import meHandler from '../../api/users/me.js'
import sellerHandler from '../../api/users/me/seller.js'
import { prisma } from '../../api/_lib/prisma.js'
import { createMockReq, createMockRes } from './helpers.js'

const { getUser } = vi.hoisted(() => ({ getUser: vi.fn() }))

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({ auth: { getUser } }),
}))

const VALID_TOKEN = 'valid-token'
const createdUserIds = []

function createAuthUser(overrides = {}) {
  const id = randomUUID()
  createdUserIds.push(id)
  return {
    id,
    email: `maya.cohen+${id.slice(0, 8)}@test.com`,
    user_metadata: { fullname: 'Maya Cohen' },
    ...overrides,
  }
}

function signInAs(authUser) {
  getUser.mockImplementation(async (token) =>
    token === VALID_TOKEN
      ? { data: { user: authUser }, error: null }
      : { data: { user: null }, error: new Error('Invalid JWT') },
  )
}

async function callApi(handler, { method = 'GET', body, token = VALID_TOKEN } = {}) {
  const res = createMockRes()
  const headers = token ? { authorization: `Bearer ${token}` } : {}
  await handler(createMockReq({ method, body, headers }), res)
  return res
}

beforeEach(() => {
  getUser.mockReset()
})

afterAll(async () => {
  await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } })
  await prisma.$disconnect()
})

describe('/api/users/me', () => {
  it('returns 401 without a token', async () => {
    signInAs(createAuthUser())

    const responses = await Promise.all([
      callApi(meHandler, { token: null }),
      callApi(meHandler, { method: 'PATCH', body: { fullname: 'Noa' }, token: null }),
      callApi(sellerHandler, { method: 'POST', token: null }),
      callApi(meHandler, { token: 'expired-token' }),
    ])

    responses.forEach((res) => expect(res.statusCode).toBe(401))
  })

  it('creates the user on the first request', async () => {
    const authUser = createAuthUser({
      user_metadata: { fullname: 'Maya Cohen', imgUrl: 'https://example.test/maya.jpg' },
    })
    signInAs(authUser)

    const res = await callApi(meHandler)

    expect(res.statusCode).toBe(200)
    expect(res.body).toMatchObject({
      id: authUser.id,
      fullname: 'Maya Cohen',
      imgUrl: 'https://example.test/maya.jpg',
      username: authUser.email
        .split('@')[0]
        .replace(/[^a-z0-9_]/g, '')
        .slice(0, 20),
      isSeller: false,
      level: 'NEW',
      languages: [],
    })
    expect(await prisma.user.count({ where: { id: authUser.id } })).toBe(1)
  })

  it('returns the existing user on the next requests', async () => {
    const authUser = createAuthUser()
    signInAs(authUser)
    const first = await callApi(meHandler)

    signInAs({ ...authUser, user_metadata: { fullname: 'Changed In Supabase' } })
    const second = await callApi(meHandler)

    expect(second.statusCode).toBe(200)
    expect(second.body).toEqual(first.body)
    expect(second.body.fullname).toBe('Maya Cohen')
    expect(await prisma.user.count({ where: { id: authUser.id } })).toBe(1)
  })

  it('updates only the allowed fields', async () => {
    const authUser = createAuthUser()
    signInAs(authUser)
    const { body: before } = await callApi(meHandler)

    const res = await callApi(meHandler, {
      method: 'PATCH',
      body: {
        fullname: '  Maya Levi  ',
        about: 'Logo designer from Tel Aviv',
        country: 'Israel',
        languages: ['Hebrew', 'English', 'English'],
        isSeller: true,
        level: 'TOP_RATED',
        username: 'someone_else',
        id: randomUUID(),
      },
    })

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({
      ...before,
      fullname: 'Maya Levi',
      about: 'Logo designer from Tel Aviv',
      country: 'Israel',
      languages: ['Hebrew', 'English'],
    })
    const dbUser = await prisma.user.findUnique({ where: { id: authUser.id } })
    expect(dbUser).toMatchObject({ isSeller: false, level: 'NEW', username: before.username })
  })

  it('rejects an empty full name or a wrong type with 400', async () => {
    signInAs(createAuthUser())

    const emptyName = await callApi(meHandler, { method: 'PATCH', body: { fullname: '   ' } })
    const badLanguages = await callApi(meHandler, {
      method: 'PATCH',
      body: { languages: 'Hebrew' },
    })

    expect(emptyName.statusCode).toBe(400)
    expect(badLanguages.statusCode).toBe(400)
  })

  it('gives a new user another username when the email name is taken', async () => {
    const first = createAuthUser({ email: 'same.name@test.com' })
    const second = createAuthUser({ email: 'same.name@other.test' })

    signInAs(first)
    const firstRes = await callApi(meHandler)
    signInAs(second)
    const secondRes = await callApi(meHandler)

    expect(firstRes.body.username).toBe('samename')
    expect(secondRes.statusCode).toBe(200)
    expect(secondRes.body.username).toMatch(/^samename_[0-9a-f]{8}$/)
  })
})

describe('/api/users/me/seller', () => {
  it('marks the user as a seller', async () => {
    const authUser = createAuthUser()
    signInAs(authUser)

    const res = await callApi(sellerHandler, { method: 'POST' })

    expect(res.statusCode).toBe(200)
    expect(res.body).toMatchObject({ id: authUser.id, isSeller: true })
    const dbUser = await prisma.user.findUnique({ where: { id: authUser.id } })
    expect(dbUser.isSeller).toBe(true)
  })

  it('allows only POST', async () => {
    signInAs(createAuthUser())

    const res = await callApi(sellerHandler, { method: 'GET' })

    expect(res.statusCode).toBe(405)
    expect(res.headers.Allow).toBe('POST')
  })
})
