import { describe, it, expect } from 'vitest'
import { createHandler, HttpError } from '../../api/_lib/http.js'
import { createMockReq, createMockRes } from './helpers.js'

describe('createHandler', () => {
  it('runs the handler that matches the request method', async () => {
    const handler = createHandler({
      GET: (_req, res) => res.status(200).json({ ok: true }),
    })
    const res = createMockRes()

    await handler(createMockReq({ method: 'GET' }), res)

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ ok: true })
  })

  it('returns 405 with an Allow header for an unsupported method', async () => {
    const handler = createHandler({ GET: () => {}, POST: () => {} })
    const res = createMockRes()

    await handler(createMockReq({ method: 'DELETE' }), res)

    expect(res.statusCode).toBe(405)
    expect(res.headers.Allow).toBe('GET, POST')
  })

  it('maps an HttpError to its status and message', async () => {
    const handler = createHandler({
      GET: () => {
        throw new HttpError(404, 'Gig not found')
      },
    })
    const res = createMockRes()

    await handler(createMockReq(), res)

    expect(res.statusCode).toBe(404)
    expect(res.body).toEqual({ error: 'Gig not found' })
  })

  it('hides unexpected errors behind a 500', async () => {
    const handler = createHandler({
      GET: () => {
        throw new Error('db exploded')
      },
    })
    const res = createMockRes()

    await handler(createMockReq(), res)

    expect(res.statusCode).toBe(500)
    expect(res.body).toEqual({ error: 'Internal server error' })
  })
})
