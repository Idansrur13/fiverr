import { gigService } from '../services/gig.service'

export const SET_GIGS = 'SET_GIGS'
export const SET_GIGS_PAGE = 'SET_GIGS_PAGE'
export const SET_GIG = 'SET_GIG'
export const ADD_GIG = 'ADD_GIG'
export const UPDATE_GIG = 'UPDATE_GIG'
export const REMOVE_GIG = 'REMOVE_GIG'
export const SET_FILTER_BY = 'SET_FILTER_BY'

const initialState = {
  gigs: [],
  // Explore's current page: the total of all matching gigs, not only this page
  pageInfo: { total: 0, page: 1, pageCount: 0 },
  gig: null,
  filterBy: gigService.getDefaultFilter(),
}

export function gigReducer(state = initialState, action = {}) {
  switch (action.type) {
    case SET_GIGS:
      return { ...state, gigs: action.gigs }
    case SET_GIGS_PAGE: {
      const { gigs, total, page, pageCount } = action.gigsPage
      return { ...state, gigs, pageInfo: { total, page, pageCount } }
    }
    case SET_GIG:
      return { ...state, gig: action.gig }
    case ADD_GIG:
      return { ...state, gigs: [...state.gigs, action.gig] }
    case UPDATE_GIG:
      return {
        ...state,
        gigs: state.gigs.map((gig) => (gig.id === action.gig.id ? action.gig : gig)),
        gig: state.gig?.id === action.gig.id ? action.gig : state.gig,
      }
    case REMOVE_GIG:
      return {
        ...state,
        gigs: state.gigs.filter((gig) => gig.id !== action.gigId),
        gig: state.gig?.id === action.gigId ? null : state.gig,
      }
    case SET_FILTER_BY:
      return { ...state, filterBy: { ...state.filterBy, ...action.filterBy } }
    default:
      return state
  }
}
