import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const testEnv = loadEnv('test', process.cwd(), '')
for (const [key, value] of Object.entries(testEnv)) {
  if (process.env.VITEST && process.env[key] === undefined) process.env[key] = value
}

function localGigApiPlugin() {
  let handlerPromise

  return {
    name: 'local-gig-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/gigs', async (req, res, next) => {
        try {
          const env = loadEnv(server.config.mode, process.cwd(), '')
          for (const [key, value] of Object.entries(env)) {
            if (process.env[key] === undefined) process.env[key] = value
          }

          handlerPromise ??= import('./api/gigs/[id].js')
          const { default: handler } = await handlerPromise
          const url = new URL(req.url || '/', 'http://localhost')
          const gigId = url.pathname.replace(/^\/+/, '')
          const query = Object.fromEntries(url.searchParams)
          if (gigId) query.id = decodeURIComponent(gigId)

          const apiRes = {
            status(code) {
              res.statusCode = code
              return this
            },
            json(data) {
              res.setHeader('Content-Type', 'application/json; charset=utf-8')
              res.end(JSON.stringify(data))
              return this
            },
            setHeader(name, value) {
              res.setHeader(name, value)
              return this
            },
          }

          await handler({ method: req.method, headers: req.headers, query }, apiRes)
        } catch (error) {
          next(error)
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), localGigApiPlugin()],
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'web',
          environment: 'jsdom',
          include: ['src/**/*.test.{js,jsx}'],
          setupFiles: ['./tests/web.setup.js'],
        },
      },
      {
        test: {
          name: 'api',
          environment: 'node',
          include: ['tests/api/**/*.test.js'],
          globalSetup: ['./tests/api.global-setup.js'],
          // The API tests share one DB, so their files must run one after another.
          // `fileParallelism: false` is ignored inside a project, so a single fork is used instead.
          pool: 'forks',
          poolOptions: { forks: { singleFork: true } },
        },
      },
    ],
  },
})
