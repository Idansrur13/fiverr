import { pathToFileURL } from 'node:url'
import { PrismaClient } from '@prisma/client'
import { CATEGORIES, buildSeedData, loadDemoGigs } from './seed-data.js'

// Upsert by id everywhere, so running the seed again updates rows instead of duplicating them
async function upsertById(model, rows) {
  for (const { id, ...data } of rows) {
    await model.upsert({ where: { id }, update: data, create: { id, ...data } })
  }
}

export async function seed(prisma, demoGigs = loadDemoGigs()) {
  for (const category of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: category,
    })
  }
  const categories = await prisma.category.findMany({ select: { id: true, slug: true } })
  const categoryIdBySlug = Object.fromEntries(categories.map(({ id, slug }) => [slug, id]))

  const { users, gigs, packages, orders, reviews } = buildSeedData(demoGigs)

  await upsertById(prisma.user, users)
  await upsertById(
    prisma.gig,
    gigs.map(({ categorySlug, ...gig }) => ({
      ...gig,
      categoryId: categoryIdBySlug[categorySlug],
    })),
  )
  await upsertById(prisma.package, packages)
  await upsertById(prisma.order, orders)
  await upsertById(prisma.review, reviews)
}

// Runs only from the command line (`npm run db:seed`), not when a test imports `seed`
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const prisma = new PrismaClient()
  seed(prisma)
    .catch((err) => {
      process.stderr.write(`${err.stack}\n`)
      process.exitCode = 1
    })
    .finally(() => prisma.$disconnect())
}
