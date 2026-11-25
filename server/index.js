import { parseArgs } from 'node:util'
import { createApp } from './app.js'

const { values: args } = parseArgs({ options: { port: { type: 'string' } } })
const port = Number(args.port ?? process.env.PORT) || 3000
const app = await createApp()

app.listen(port, (err) => {
  if (err) throw err
  console.log(`Server is running on http://localhost:${port}`)
})
