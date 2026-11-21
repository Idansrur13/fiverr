import { gigService } from '../services/gig.service'
import { store } from './store'
import { ADD_GIG, REMOVE_GIG, SET_FILTER_BY, SET_GIG, SET_GIGS, UPDATE_GIG } from './gig.reducer'

export async function loadGigs(filterBy = store.getState().gigModule.filterBy) {
  const gigs = await gigService.query(filterBy)
  store.dispatch({ type: SET_GIGS, gigs })
  return gigs
}

export async function loadGig(gigId, signal) {
  const gig = await gigService.getById(gigId)
  if (signal?.aborted) return gig
  store.dispatch({ type: SET_GIG, gig })
  return gig
}

export async function saveGig(gig) {
  const type = gig.id ? UPDATE_GIG : ADD_GIG
  const savedGig = await gigService.save(gig)
  store.dispatch({ type, gig: savedGig })
  return savedGig
}

export async function removeGig(gigId) {
  await gigService.remove(gigId)
  store.dispatch({ type: REMOVE_GIG, gigId })
}

export function setFilterBy(filterBy) {
  store.dispatch({ type: SET_FILTER_BY, filterBy })
}
