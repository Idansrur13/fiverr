import { execSync } from 'node:child_process'
import { loadEnv } from 'vite'

const inheritedDatabaseUrls = {
  DATABASE_URL: process.env.DATABASE_URL,
  DIRECT_URL: process.env.DIRECT_URL,
}
delete process.env.DATABASE_URL
delete process.env.DIRECT_URL
const testEnv = loadEnv('test', process.cwd(), '')
for (const key of ['DATABASE_URL', 'DIRECT_URL']) {
  const value = testEnv[key] || inheritedDatabaseUrls[key]
  if (value) process.env[key] = value
}

function getDatabaseName(url) {
  try {
    return new URL(url).pathname.slice(1)
  } catch {
    return ''
  }
}

function assertTestDatabase() {
  for (const key of ['DATABASE_URL', 'DIRECT_URL']) {
    if (!process.env[key]) continue
    const dbName = getDatabaseName(process.env[key])
    if (!dbName.endsWith('_test')) {
      throw new Error(
        `API tests delete data, so ${key} must point to a database whose name ends with "_test" (got "${dbName}")`,
      )
    }
  }
}

export default function setup() {
  assertTestDatabase()
  execSync('npx prisma migrate deploy', { stdio: 'inherit', env: process.env })
}
