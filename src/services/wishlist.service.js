// The saved gig ids of each user, in localStorage under `wishlist_<userId>`.
// Async like the other services, so it can move to an API without changing the callers.
const STORAGE_KEY_PREFIX = 'wishlist_'

export const wishlistService = {
  query,
  add,
  remove,
}

async function query(userId) {
  return _load(userId)
}

async function add(userId, gigId) {
  const gigIds = _load(userId)
  if (gigIds.includes(gigId)) return gigIds
  const updatedIds = [...gigIds, gigId]
  _save(userId, updatedIds)
  return updatedIds
}

async function remove(userId, gigId) {
  const updatedIds = _load(userId).filter((id) => id !== gigId)
  _save(userId, updatedIds)
  return updatedIds
}

function _load(userId) {
  const stored = localStorage.getItem(STORAGE_KEY_PREFIX + userId)
  return stored ? JSON.parse(stored) : []
}

function _save(userId, gigIds) {
  localStorage.setItem(STORAGE_KEY_PREFIX + userId, JSON.stringify(gigIds))
}
