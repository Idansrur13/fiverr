import { realpathSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { PrismaClient } from '@prisma/client'
import { categoryService } from '../src/services/category.service.js'
import { buildSeedData, loadDemoGigs } from './seed-data.js'

// Upsert by id everywhere, so running the seed again updates rows instead of duplicating them
function upsertById(model, rows) {
  return rows.map(({ id, ...data }) =>
    model.upsert({ where: { id }, update: data, create: { id, ...data } }),
  )
}

export async function seed(prisma, demoGigs = loadDemoGigs()) {
  await prisma.$transaction(
    categoryService.getCategories().map((category) =>
      prisma.category.upsert({
        where: { slug: category.slug },
        update: { name: category.name },
        create: category,
      }),
    ),
  )
  const categories = await prisma.category.findMany({ select: { id: true, slug: true } })
  const categoryIdBySlug = Object.fromEntries(categories.map(({ id, slug }) => [slug, id]))

  const { users, gigs, packages, orders, reviews } = buildSeedData(demoGigs)

  const unknownSlugs = [...new Set(gigs.map(({ categorySlug }) => categorySlug))].filter(
    (slug) => !categoryIdBySlug[slug],
  )
  if (unknownSlugs.length) throw new Error(`Unknown gig categories: ${unknownSlugs.join(', ')}`)

  await prisma.$transaction([
    ...upsertById(prisma.user, users),
    ...upsertById(
      prisma.gig,
      gigs.map(({ categorySlug, ...gig }) => ({
        ...gig,
        categoryId: categoryIdBySlug[categorySlug],
      })),
    ),
    ...upsertById(prisma.package, packages),
    ...upsertById(prisma.order, orders),
    ...upsertById(prisma.review, reviews),
  ])
}

function isRunFromCli() {
  try {
    return realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)
  } catch {
    return false
  }
}

// Runs only from the command line (`npm run db:seed`), not when a test imports `seed`
if (isRunFromCli()) {
  const prisma = new PrismaClient()
  seed(prisma)
    .catch((err) => {
      process.stderr.write(`${err.stack}\n`)
      process.exitCode = 1
    })
    .finally(() => prisma.$disconnect())
}
