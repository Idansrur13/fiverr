import axios from 'axios'
import { userService } from './user.service'

export const httpClient = axios.create({ baseURL: '/api' })

httpClient.interceptors.request.use(async (config) => {
  const token = await userService.getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const httpService = {
  get(endpoint, params) {
    return request({ method: 'GET', url: endpoint, params })
  },
  post(endpoint, data) {
    return request({ method: 'POST', url: endpoint, data })
  },
  put(endpoint, data) {
    return request({ method: 'PUT', url: endpoint, data })
  },
  patch(endpoint, data) {
    return request({ method: 'PATCH', url: endpoint, data })
  },
  delete(endpoint) {
    return request({ method: 'DELETE', url: endpoint })
  },
}

async function request(config) {
  const res = await httpClient(config)
  return res.data
}
