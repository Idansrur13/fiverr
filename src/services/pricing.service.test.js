import { describe, it, expect } from 'vitest'
import { calcOrderTotal, roundToCents } from '../../shared/pricing.service'

describe('pricingService', () => {
  it('calcOrderTotal adds a 5.5% service fee', () => {
    expect(calcOrderTotal(100)).toEqual({ price: 100, serviceFee: 5.5, total: 105.5 })
  })

  it('calcOrderTotal rounds to 2 decimal places', () => {
    expect(calcOrderTotal(19.99)).toEqual({ price: 19.99, serviceFee: 1.1, total: 21.09 })
  })

  it('roundToCents rounds half cents up', () => {
    expect(roundToCents(1.005)).toBe(1.01)
    expect(roundToCents('2.5')).toBe(2.5)
  })
})
