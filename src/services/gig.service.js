import { storageService } from './storage.service'
import { userService } from './user.service'

const STORAGE_KEY = 'gigDB'

export const gigService = {
  query,
  getById,
  save,
  remove,
  getDefaultFilter,
  getEmptyGig,
}

async function query(filterBy = {}) {
  const { txt = '', category, minPrice, maxPrice, daysToMake } = filterBy
  const gigs = await storageService.query(STORAGE_KEY)
  const search = txt.trim().toLowerCase()

  return gigs.filter(
    (gig) =>
      (!search || gig.title.toLowerCase().includes(search)) &&
      (!category || gig.category === category) &&
      (!minPrice || gig.price >= +minPrice) &&
      (!maxPrice || gig.price <= +maxPrice) &&
      (!daysToMake || gig.daysToMake <= +daysToMake),
  )
}

function getById(gigId) {
  return storageService.get(STORAGE_KEY, gigId)
}

function save(gig) {
  if (gig.id) return storageService.put(STORAGE_KEY, gig)
  return storageService.post(STORAGE_KEY, { ...gig, createdAt: Date.now() })
}

function remove(gigId) {
  return storageService.remove(STORAGE_KEY, gigId)
}

function getDefaultFilter() {
  return { txt: '', category: '', minPrice: '', maxPrice: '', daysToMake: '' }
}

function getEmptyGig() {
  return {
    title: '',
    price: '',
    daysToMake: 3,
    category: 'graphics-design',
    images: ['https://picsum.photos/seed/new-gig/800/500'],
    description: '',
    owner: userService.getLoggedinUser(),
    reviews: [],
    status: 'ACTIVE',
  }
}
