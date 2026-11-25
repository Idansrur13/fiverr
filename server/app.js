import express from 'express'
import { readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT_DIR = fileURLToPath(new URL('..', import.meta.url))

export async function createApp({
  apiDir = path.join(ROOT_DIR, 'api'),
  distDir = path.join(ROOT_DIR, 'dist'),
} = {}) {
  const app = express()
  app.disable('x-powered-by')
  app.use(express.json())

  for (const route of await loadApiRoutes(apiDir)) {
    app.all(route.path, withParamsInQuery(route.handler))
  }
  app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }))

  app.use(
    '/assets',
    express.static(path.join(distDir, 'assets'), {
      immutable: true,
      maxAge: '1y',
      fallthrough: false,
    }),
  )
  app.use(express.static(distDir))
  app.get('/{*splat}', (_req, res) => res.sendFile(path.join(distDir, 'index.html')))

  app.use(handleError)
  return app
}

export function toRoutePath(relativeFile) {
  const segments = relativeFile.replace(/\.js$/, '').split(path.sep)
  if (segments.at(-1) === 'index') segments.pop()
  const routeSegments = segments.map((segment) => segment.replace(/^\[(\w+)\]$/, ':$1'))
  return ['/api', ...routeSegments].join('/')
}

async function loadApiRoutes(apiDir) {
  const files = await findRouteFiles(apiDir)
  const routes = await Promise.all(
    files.map(async (file) => {
      const { default: handler } = await import(pathToFileURL(file).href)
      return { path: toRoutePath(path.relative(apiDir, file)), handler }
    }),
  )
  return routes.sort((a, b) => countParams(a.path) - countParams(b.path))
}

async function findRouteFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    entries
      .filter((entry) => !entry.name.startsWith('_') && !entry.name.startsWith('.'))
      .map((entry) => {
        const entryPath = path.join(dir, entry.name)
        if (entry.isDirectory()) return findRouteFiles(entryPath)
        return entry.name.endsWith('.js') ? [entryPath] : []
      }),
  )
  return files.flat()
}

function countParams(routePath) {
  return routePath.split('/').filter((segment) => segment.startsWith(':')).length
}

function withParamsInQuery(handler) {
  return (req, res) => {
    Object.defineProperty(req, 'query', {
      value: { ...req.query, ...req.params },
      enumerable: true,
    })
    return handler(req, res)
  }
}

function handleError(err, _req, res, next) {
  if (res.headersSent) return next(err)
  const status = err.status ?? 500
  return res.status(status).json({ error: err.expose ? err.message : 'Internal server error' })
}
