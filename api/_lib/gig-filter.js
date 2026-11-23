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

function toNumber(value) {
  const param = getParam(value).trim()
  if (!param) return null
  const number = Number(param)
  return Number.isFinite(number) ? number : null
}
