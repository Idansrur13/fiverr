import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const testEnv = loadEnv('test', process.cwd(), '')
for (const [key, value] of Object.entries(testEnv)) {
  if (process.env.VITEST && process.env[key] === undefined) process.env[key] = value
}

export default defineConfig({
  plugins: [react()],
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
          fileParallelism: false,
        },
      },
    ],
  },
})
