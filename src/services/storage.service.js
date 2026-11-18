import demoGigs from '../data/gigs.json'

const DELAY = import.meta.env.MODE === 'test' ? 0 : 300

const demoData = {
  gigDB: demoGigs,
}

export const storageService = {
  query,
  get,
  post,
  put,
  remove,
}

async function query(entityType) {
  await _delay()
  return _load(entityType)
}

async function get(entityType, entityId) {
  const entities = await query(entityType)
  const entity = entities.find((entity) => entity.id === entityId)
  if (!entity) throw new Error(`Cannot find ${entityId} in ${entityType}`)
  return entity
}

async function post(entityType, newEntity) {
  const entities = await query(entityType)
  const entity = { ...newEntity, id: _makeId() }
  entities.push(entity)
  _save(entityType, entities)
  return entity
}

async function put(entityType, updatedEntity) {
  const entities = await query(entityType)
  const idx = entities.findIndex((entity) => entity.id === updatedEntity.id)
  if (idx === -1) throw new Error(`Cannot update ${updatedEntity.id} in ${entityType}`)
  const entity = { ...entities[idx], ...updatedEntity }
  entities.splice(idx, 1, entity)
  _save(entityType, entities)
  return entity
}

async function remove(entityType, entityId) {
  const entities = await query(entityType)
  const idx = entities.findIndex((entity) => entity.id === entityId)
  if (idx === -1) throw new Error(`Cannot remove ${entityId} from ${entityType}`)
  entities.splice(idx, 1)
  _save(entityType, entities)
}

function _load(entityType) {
  const stored = localStorage.getItem(entityType)
  if (stored) return JSON.parse(stored)
  _save(entityType, demoData[entityType] || [])
  return JSON.parse(localStorage.getItem(entityType))
}

function _save(entityType, entities) {
  localStorage.setItem(entityType, JSON.stringify(entities))
}

function _delay() {
  return new Promise((resolve) => setTimeout(resolve, DELAY))
}

function _makeId(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let id = ''
  for (let i = 0; i < length; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return id
}
