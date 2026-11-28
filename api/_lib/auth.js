import { createClient } from '@supabase/supabase-js'
import { HttpError } from './http.js'
import { prisma } from './prisma.js'

export const ME_SELECT = {
  id: true,
  username: true,
  fullname: true,
  imgUrl: true,
  isSeller: true,
  level: true,
  about: true,
  country: true,
  languages: true,
  createdAt: true,
}

const USERNAME_MAX_LENGTH = 20

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

export async function requireAppUser(req) {
  const authUser = await requireUser(req)
  const user = await prisma.user.findUnique({ where: { id: authUser.id }, select: ME_SELECT })
  return user ?? createAppUser(authUser)
}

async function createAppUser(authUser) {
  const metadata = authUser.user_metadata ?? {}
  try {
    return await prisma.user.create({
      data: {
        id: authUser.id,
        username: await getFreeUsername(authUser),
        fullname: metadata.fullname || getEmailName(authUser.email) || 'New user',
        imgUrl: metadata.imgUrl || null,
        isSeller: false,
      },
      select: ME_SELECT,
    })
  } catch (err) {
    if (err.code !== 'P2002') throw err
    const user = await prisma.user.findUnique({ where: { id: authUser.id }, select: ME_SELECT })
    if (!user) throw err
    return user
  }
}

async function getFreeUsername({ id, email }) {
  const base =
    getEmailName(email)
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '')
      .slice(0, USERNAME_MAX_LENGTH) || 'user'
  const takenUser = await prisma.user.findUnique({
    where: { username: base },
    select: { id: true },
  })
  return takenUser ? `${base}_${id.replace(/-/g, '').slice(0, 8)}` : base
}

function getEmailName(email) {
  return (email ?? '').split('@')[0]
}
