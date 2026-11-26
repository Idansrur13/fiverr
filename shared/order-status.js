export const ORDER_STATUSES = ['PENDING', 'IN_PROGRESS', 'DELIVERED', 'COMPLETED', 'CANCELLED']

const NEXT_STATUSES_BY_STATUS = {
  PENDING: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['DELIVERED'],
  DELIVERED: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
}

export function getNextStatuses(status) {
  return NEXT_STATUSES_BY_STATUS[status] || []
}

export function isValidStatusTransition(currentStatus, nextStatus) {
  return getNextStatuses(currentStatus).includes(nextStatus)
}
