let supabase = null

export function isSupabaseConfigured() {
  return Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)
}

export async function getSupabase() {
  if (supabase) return supabase
  if (!isSupabaseConfigured()) {
    throw new Error('Login is not set up: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are missing')
  }
  const { createClient } = await import('@supabase/supabase-js')
  supabase ??= createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
  )
  return supabase
}
