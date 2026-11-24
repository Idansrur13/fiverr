import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

const { createClient } = vi.hoisted(() => ({ createClient: vi.fn() }))

vi.mock('@supabase/supabase-js', () => ({ createClient }))

async function loadService() {
  vi.resetModules()
  return import('./supabase.service')
}

describe('supabase.service', () => {
  beforeEach(() => {
    createClient.mockReset()
    createClient.mockReturnValue({ auth: {} })
    vi.stubEnv('VITE_SUPABASE_URL', '')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('is not set up without the VITE_ keys', async () => {
    const { isSupabaseConfigured, getSupabase } = await loadService()

    expect(isSupabaseConfigured()).toBe(false)
    await expect(getSupabase()).rejects.toThrow(
      'Login is not set up: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are missing',
    )
    expect(createClient).not.toHaveBeenCalled()
  })

  it('creates the client from the VITE_ keys', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test-ref.supabase.co')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key')
    const { isSupabaseConfigured, getSupabase } = await loadService()

    expect(isSupabaseConfigured()).toBe(true)
    const client = await getSupabase()

    expect(createClient).toHaveBeenCalledWith('https://test-ref.supabase.co', 'test-anon-key')
    expect(await getSupabase()).toBe(client)
    expect(createClient).toHaveBeenCalledTimes(1)
  })

  it('ignores keys without the VITE_ prefix, which never reach the browser', async () => {
    vi.stubEnv('NEXT_PUBLIC_STOEAGE_SUPABASE_URL', 'https://test-ref.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_STOEAGE_SUPABASE_ANON_KEY', 'test-anon-key')
    const { isSupabaseConfigured, getSupabase } = await loadService()

    expect(isSupabaseConfigured()).toBe(false)
    await expect(getSupabase()).rejects.toThrow('Login is not set up')
  })
})
