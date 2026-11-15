export function createMockReq({ method = 'GET', query = {}, body, headers = {} } = {}) {
  return { method, query, body, headers }
}

export function createMockRes() {
  const res = {
    statusCode: 200,
    headers: {},
    body: undefined,
    status(code) {
      res.statusCode = code
      return res
    },
    json(data) {
      res.body = data
      return res
    },
    setHeader(name, value) {
      res.headers[name] = value
      return res
    },
  }
  return res
}
