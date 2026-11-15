export class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

export function createHandler(methodHandlers) {
  const allowedMethods = Object.keys(methodHandlers)

  return async function handler(req, res) {
    const methodHandler = methodHandlers[req.method]

    if (!methodHandler) {
      res.setHeader('Allow', allowedMethods.join(', '))
      return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
      return await methodHandler(req, res)
    } catch (err) {
      if (err instanceof HttpError) return res.status(err.status).json({ error: err.message })
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
}
