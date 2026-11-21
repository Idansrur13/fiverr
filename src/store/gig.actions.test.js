import { describe, it, expect, vi, afterEach } from 'vitest'
import { loadGigs } from './gig.actions'
import { store } from './store'
import { gigService } from '../services/gig.service'
import demoGigs from '../data/gigs.json'

describe('gig actions', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('loadGigs keeps the latest results when an older query returns last', async () => {
    const oldGigs = demoGigs.slice(0, 3)
    const newGigs = demoGigs.slice(3, 4)
    let resolveOldQuery
    vi.spyOn(gigService, 'query')
      .mockImplementationOnce(() => new Promise((resolve) => (resolveOldQuery = resolve)))
      .mockImplementationOnce(() => Promise.resolve(newGigs))

    const oldLoad = loadGigs({ txt: '' })
    await loadGigs({ txt: 'new' })
    resolveOldQuery(oldGigs)
    await oldLoad

    expect(store.getState().gigModule.gigs).toEqual(newGigs)
  })
})
