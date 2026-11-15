import { createClient } from '@supabase/supabase-js'
import { HttpError } from './http.js'

let supabase

function getSupabase() {
  if (!supabase) supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
  return supabase
}

export function getBearerToken(req) {
  const header = req.headers?.authorization ?? ''
  const [scheme, token] = header.split(' ')
  return scheme === 'Bearer' && token ? token : null
}

export async function requireUser(req) {
  const token = getBearerToken(req)
  if (!token) throw new HttpError(401, 'Missing access token')

  const { data, error } = await getSupabase().auth.getUser(token)
  if (error || !data?.user) throw new HttpError(401, 'Invalid access token')

  return data.user
}
