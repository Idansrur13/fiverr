import { execSync } from 'node:child_process'

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
