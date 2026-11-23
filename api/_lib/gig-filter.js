import { Prisma } from '@prisma/client'

// Builds the Prisma `where` for GET /api/gigs from the same params the Explore URL uses.
// Price and delivery time are checked against the BASIC package (the "starting at" package).
export function buildGigWhere(filterBy = {}) {
  const txt = getParam(filterBy.txt).trim()
  const category = getParam(filterBy.category).trim()
  const minPrice = toNumber(filterBy.minPrice)
  const maxPrice = toNumber(filterBy.maxPrice)
  const daysToMake = toNumber(filterBy.daysToMake)

  const where = {}
  if (txt) where.title = { contains: txt, mode: 'insensitive' }
  if (category) where.category = { slug: category }

  const basicPackage = {}
  if (minPrice !== null || maxPrice !== null) {
    basicPackage.price = {}
    if (minPrice !== null) basicPackage.price.gte = minPrice
    if (maxPrice !== null) basicPackage.price.lte = maxPrice
  }
  if (daysToMake !== null) basicPackage.daysToMake = { lte: daysToMake }
  if (Object.keys(basicPackage).length) {
    where.packages = { some: { tier: 'BASIC', ...basicPackage } }
  }

  return where
}

// Query params can arrive as an array (?txt=a&txt=b), so only the first value is used
function getParam(value) {
  const firstValue = Array.isArray(value) ? value[0] : value
  return firstValue == null ? '' : String(firstValue)
}

function toPositiveInt(value) {
  const number = toNumber(value)
  return Number.isInteger(number) && number > 0 ? number : null
}

function toNumber(value) {
  const param = getParam(value).trim()
  if (!param) return null
  const number = Number(param)
  return Number.isFinite(number) ? number : null
}

export const SORT_OPTIONS = ['recommended', 'best-selling', 'newest']
export const DEFAULT_PAGE_SIZE = 12
const MAX_PAGE_SIZE = 100

// Reads sortBy / page / pageSize from the query. Anything invalid falls back to the default.
export function getGigPaging(query = {}) {
  const sortBy = getParam(query.sortBy).trim()
  return {
    sortBy: SORT_OPTIONS.includes(sortBy) ? sortBy : 'recommended',
    page: toPositiveInt(query.page) ?? 1,
    pageSize: Math.min(toPositiveInt(query.pageSize) ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE),
  }
}

// Only whitelisted SQL goes into ORDER BY. Ties always end with the newest gig, then the id,
// so the same request returns the same order every time.
const ORDER_BY_SQL = {
  recommended: Prisma.sql`
    (SELECT AVG(r."rating") FROM "Review" r WHERE r."gigId" = g."id") DESC NULLS LAST,
    (SELECT COUNT(*) FROM "Review" r WHERE r."gigId" = g."id") DESC,`,
  'best-selling': Prisma.sql`
    (SELECT COUNT(*) FROM "Order" o WHERE o."gigId" = g."id") DESC,`,
  newest: Prisma.empty,
}

// Prisma can't orderBy an average of a relation, so the order comes from raw SQL:
// 1. the gigs that match `where` (built by buildGigWhere), 2. one sorted page of their ids.
// A page after the last one is clamped to the last page.
export async function findGigIdsPage(prisma, where, { sortBy, page, pageSize }) {
  const matchingGigs = await prisma.gig.findMany({ where, select: { id: true } })
  const total = matchingGigs.length
  const pageCount = Math.ceil(total / pageSize)
  const currentPage = Math.min(page, Math.max(pageCount, 1))
  if (!total) return { ids: [], total, page: currentPage, pageCount }

  const ids = matchingGigs.map((gig) => gig.id)
  const rows = await prisma.$queryRaw`
    SELECT g."id" FROM "Gig" g
    WHERE g."id" = ANY(${ids}::uuid[])
    ORDER BY ${ORDER_BY_SQL[sortBy]} g."createdAt" DESC, g."id"
    LIMIT ${pageSize} OFFSET ${(currentPage - 1) * pageSize}`

  return { ids: rows.map((row) => row.id), total, page: currentPage, pageCount }
}
