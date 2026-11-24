import { describe, it, expect, beforeEach, vi } from 'vitest'
import { httpClient, httpService } from './http.service'

const { auth } = vi.hoisted(() => ({
  auth: { getSession: vi.fn() },
}))

vi.mock('./supabase.service', () => ({
  getSupabase: async () => ({ auth }),
  isSupabaseConfigured: () => true,
}))

describe('httpService', () => {
  let adapter

  beforeEach(() => {
    adapter = vi.fn(async (config) => ({
      data: { ok: true },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    }))
    httpClient.defaults.adapter = adapter
  })

  it('sends the access token as a Bearer header on every request', async () => {
    auth.getSession.mockResolvedValue({ data: { session: { access_token: 'token-123' } } })

    const data = await httpService.get('gigs', { page: 2 })
    await httpService.post('gigs', { title: 'Logo' })

    expect(data).toEqual({ ok: true })
    const [getConfig] = adapter.mock.calls[0]
    expect(getConfig).toMatchObject({
      baseURL: '/api',
      url: 'gigs',
      method: 'get',
      params: { page: 2 },
    })
    expect(getConfig.headers.Authorization).toBe('Bearer token-123')
    expect(adapter.mock.calls[1][0].headers.Authorization).toBe('Bearer token-123')
  })

  it('sends no Authorization header when nobody is logged in', async () => {
    auth.getSession.mockResolvedValue({ data: { session: null } })

    await httpService.get('categories')

    const [config] = adapter.mock.calls[0]
    expect(config.headers.Authorization).toBeUndefined()
  })
})
