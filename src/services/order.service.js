import { httpService } from './http.service'

const NEXT_STATUSES_BY_STATUS = {
  PENDING: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['DELIVERED'],
  DELIVERED: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
}

function getNextStatuses(status) {
  return NEXT_STATUSES_BY_STATUS[status] || []
}

function isValidStatusTransition(currentStatus, nextStatus) {
  return getNextStatuses(currentStatus).includes(nextStatus)
}

export { getNextStatuses, isValidStatusTransition }

export const orderService = {
  query,
  add,
  getById,
  updateStatus,
}

function query({ sellerId, role, status } = {}) {
  const resolvedRole = role || (sellerId ? 'seller' : 'buyer')
  const params = { role: resolvedRole }
  if (status) params.status = status
  return request(() => httpService.get('orders', params))
}

function add({ gig, pkg, gigId = gig?.id, packageId = pkg?.id }) {
  return request(() => httpService.post('orders', { gigId, packageId }))
}

function getById(orderId) {
  return request(() => httpService.get(`orders/${encodeURIComponent(orderId)}`))
}

function updateStatus(orderId, status) {
  return request(() =>
    httpService.patch(`orders/${encodeURIComponent(orderId)}/status`, { status }),
  )
}

async function request(apiCall) {
  try {
    return await apiCall()
  } catch (cause) {
    const status = cause?.response?.status
    const error = new Error(
      cause?.response?.data?.error ||
        (status === 401
          ? 'Please log in to continue'
          : status === 403
            ? 'You are not allowed to perform this action'
            : status === 404
              ? 'Order or gig not found'
              : status
                ? 'Could not complete the order request'
                : 'Unable to connect to the orders service'),
      { cause },
    )
    error.status = status
    error.code =
      status === 401
        ? 'UNAUTHORIZED'
        : status === 403
          ? 'FORBIDDEN'
          : status === 404
            ? 'NOT_FOUND'
            : status
              ? 'HTTP_ERROR'
              : 'NETWORK_ERROR'
    throw error
  }
}
