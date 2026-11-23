import { describe, it, expect } from 'vitest'
import { buildGigWhere } from '../../api/_lib/gig-filter.js'

const DEFAULT_FILTER = { txt: '', category: '', minPrice: '', maxPrice: '', daysToMake: '' }

describe('buildGigWhere', () => {
  it('builds an empty where for the default filter', () => {
    expect(buildGigWhere(DEFAULT_FILTER)).toEqual({})
    expect(buildGigWhere()).toEqual({})
  })

  it('searches the title case insensitive', () => {
    expect(buildGigWhere({ ...DEFAULT_FILTER, txt: '  Logo ' })).toEqual({
      title: { contains: 'Logo', mode: 'insensitive' },
    })
  })

  it('filters by category slug', () => {
    expect(buildGigWhere({ ...DEFAULT_FILTER, category: 'music-audio' })).toEqual({
      category: { slug: 'music-audio' },
    })
  })

  it('filters by min and max starting price', () => {
    expect(buildGigWhere({ ...DEFAULT_FILTER, minPrice: '50', maxPrice: '100' })).toEqual({
      packages: { some: { tier: 'BASIC', price: { gte: 50, lte: 100 } } },
    })
    expect(buildGigWhere({ ...DEFAULT_FILTER, minPrice: '50' })).toEqual({
      packages: { some: { tier: 'BASIC', price: { gte: 50 } } },
    })
  })

  it('filters by max delivery days', () => {
    expect(buildGigWhere({ ...DEFAULT_FILTER, daysToMake: '3' })).toEqual({
      packages: { some: { tier: 'BASIC', daysToMake: { lte: 3 } } },
    })
  })

  it('ignores values that are not numbers and takes the first of repeated params', () => {
    expect(buildGigWhere({ minPrice: 'abc', daysToMake: '' })).toEqual({})
    expect(buildGigWhere({ category: ['music-audio', 'graphics-design'] })).toEqual({
      category: { slug: 'music-audio' },
    })
  })
})
