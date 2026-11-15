import { describe, it, expect } from 'vitest'
import { getBearerToken, requireUser } from '../../api/_lib/auth.js'
import { HttpError } from '../../api/_lib/http.js'
import { createMockReq } from './helpers.js'

describe('getBearerToken', () => {
  it('reads the token from a Bearer authorization header', () => {
    const req = createMockReq({ headers: { authorization: 'Bearer abc123' } })
    expect(getBearerToken(req)).toBe('abc123')
  })

  it('returns null when the header is missing or malformed', () => {
    expect(getBearerToken(createMockReq())).toBeNull()
    expect(getBearerToken(createMockReq({ headers: { authorization: 'Basic abc' } }))).toBeNull()
    expect(getBearerToken(createMockReq({ headers: { authorization: 'Bearer' } }))).toBeNull()
  })
})

describe('requireUser', () => {
  it('rejects a request without a token with 401', async () => {
    const promise = requireUser(createMockReq())

    await expect(promise).rejects.toBeInstanceOf(HttpError)
    await expect(promise).rejects.toMatchObject({ status: 401 })
  })
})
