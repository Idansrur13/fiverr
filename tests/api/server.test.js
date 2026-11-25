import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { once } from 'node:events'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { createApp, toRoutePath } from '../../server/app.js'
import { prisma } from '../../api/_lib/prisma.js'

const INDEX_HTML = '<!doctype html><div id="root"></div>'

let server
let baseUrl
let distDir

beforeAll(async () => {
  distDir = await mkdtemp(path.join(tmpdir(), 'fiverr-dist-'))
  await mkdir(path.join(distDir, 'assets'))
  await writeFile(path.join(distDir, 'index.html'), INDEX_HTML)
  await writeFile(path.join(distDir, 'assets', 'main.js'), 'export {}')

  const app = await createApp({ distDir })
  server = app.listen(0)
  await once(server, 'listening')
  baseUrl = `http://localhost:${server.address().port}`
})

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve))
  await rm(distDir, { recursive: true, force: true })
  await prisma.$disconnect()
})

function request(url, options) {
  return fetch(`${baseUrl}${url}`, options)
}

describe('toRoutePath', () => {
  it('turns a file in api/ into its route', () => {
    expect(toRoutePath('health.js')).toBe('/api/health')
    expect(toRoutePath(path.join('gigs', 'index.js'))).toBe('/api/gigs')
    expect(toRoutePath(path.join('users', '[id].js'))).toBe('/api/users/:id')
    expect(toRoutePath(path.join('users', 'me', 'seller.js'))).toBe('/api/users/me/seller')
  })
})

describe('server api routes', () => {
  it('runs the handler of the file', async () => {
    const res = await request('/api/health')

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ status: 'ok' })
  })

  it('passes the route params in req.query', async () => {
    const res = await request('/api/users/not-a-uuid')

    expect(res.status).toBe(404)
    expect(await res.json()).toEqual({ error: 'User not found' })
  })

  it('matches a fixed route before a route with params', async () => {
    const res = await request('/api/users/me')

    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ error: 'Missing access token' })
  })

  it('keeps the 405 of the handler for a method it does not support', async () => {
    const res = await request('/api/health', { method: 'POST' })

    expect(res.status).toBe(405)
    expect(res.headers.get('allow')).toBe('GET')
  })

  it('returns a json 404 for an unknown api route', async () => {
    const res = await request('/api/no-such-route')

    expect(res.status).toBe(404)
    expect(await res.json()).toEqual({ error: 'Not found' })
  })

  it('returns a json 400 for a body that is not valid json', async () => {
    const res = await request('/api/users/me/seller', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"isSeller":',
    })

    expect(res.status).toBe(400)
    expect(await res.json()).toHaveProperty('error')
  })

  it('does not load files from api/_lib as routes', async () => {
    const res = await request('/api/_lib/http')

    expect(res.status).toBe(404)
    expect(await res.json()).toEqual({ error: 'Not found' })
  })
})

describe('server frontend', () => {
  it('serves index.html for every page of the app', async () => {
    for (const url of ['/', '/explore', '/gig/123', '/seller/gigs']) {
      const res = await request(url)

      expect(res.status).toBe(200)
      expect(await res.text()).toBe(INDEX_HTML)
    }
  })

  it('serves the built assets with a long cache', async () => {
    const res = await request('/assets/main.js')

    expect(res.status).toBe(200)
    expect(res.headers.get('cache-control')).toContain('immutable')
    expect(await res.text()).toBe('export {}')
  })

  it('returns 404 for a missing asset instead of index.html', async () => {
    const res = await request('/assets/missing.js')

    expect(res.status).toBe(404)
  })
})
