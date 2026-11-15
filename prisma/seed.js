import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const categories = [
  { name: 'Graphics & Design', slug: 'graphics-design' },
  { name: 'Programming & Tech', slug: 'programming-tech' },
  { name: 'Digital Marketing', slug: 'digital-marketing' },
  { name: 'Video & Animation', slug: 'video-animation' },
  { name: 'Writing & Translation', slug: 'writing-translation' },
  { name: 'Music & Audio', slug: 'music-audio' },
  { name: 'Business', slug: 'business' },
  { name: 'AI Services', slug: 'ai-services' },
]

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: category,
    })
  }
}

main()
  .catch((err) => {
    process.stderr.write(`${err.stack}\n`)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
