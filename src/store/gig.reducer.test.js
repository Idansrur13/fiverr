import { describe, it, expect } from 'vitest'
import { gigReducer, SET_GIGS, ADD_GIG, UPDATE_GIG, REMOVE_GIG, SET_FILTER_BY } from './gig.reducer'
import { gigService } from '../services/gig.service'

const gigs = [
  { id: 'g1', title: 'Logo design', price: 50 },
  { id: 'g2', title: 'React website', price: 300 },
]

describe('gigReducer', () => {
  it('starts with empty gigs and the default filter', () => {
    const state = gigReducer(undefined, {})
    expect(state).toEqual({ gigs: [], gig: null, filterBy: gigService.getDefaultFilter() })
  })

  it('SET_GIGS replaces the gigs', () => {
    const prevState = { ...gigReducer(undefined, {}), gigs: [{ id: 'old' }] }
    const state = gigReducer(prevState, { type: SET_GIGS, gigs })
    expect(state.gigs).toEqual(gigs)
  })

  it('ADD_GIG, UPDATE_GIG and REMOVE_GIG change the list', () => {
    const newGig = { id: 'g3', title: 'Voice over', price: 40 }
    let state = gigReducer({ ...gigReducer(undefined, {}), gigs }, { type: ADD_GIG, gig: newGig })
    expect(state.gigs.map((gig) => gig.id)).toEqual(['g1', 'g2', 'g3'])

    state = gigReducer(state, {
      type: UPDATE_GIG,
      gig: { id: 'g1', title: 'Logo design', price: 80 },
    })
    expect(state.gigs[0].price).toBe(80)
    expect(state.gigs).toHaveLength(3)

    state = gigReducer(state, { type: REMOVE_GIG, gigId: 'g2' })
    expect(state.gigs.map((gig) => gig.id)).toEqual(['g1', 'g3'])
  })

  it('SET_FILTER_BY merges into the current filter', () => {
    let state = gigReducer(undefined, { type: SET_FILTER_BY, filterBy: { txt: 'logo' } })
    state = gigReducer(state, { type: SET_FILTER_BY, filterBy: { maxPrice: 100 } })
    expect(state.filterBy).toEqual({
      ...gigService.getDefaultFilter(),
      txt: 'logo',
      maxPrice: 100,
    })
  })
})
