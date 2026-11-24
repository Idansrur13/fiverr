import { describe, it, expect, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useScrollPast } from './useScrollPast'

function scrollWindowTo(y) {
  act(() => {
    Object.defineProperty(window, 'scrollY', { value: y, configurable: true, writable: true })
    window.dispatchEvent(new Event('scroll'))
  })
}

describe('useScrollPast', () => {
  afterEach(() => {
    scrollWindowTo(0)
    vi.restoreAllMocks()
  })

  it('returns false before scrolling past the threshold', () => {
    const { result } = renderHook(() => useScrollPast(150))
    expect(result.current).toBe(false)

    scrollWindowTo(100)
    expect(result.current).toBe(false)

    scrollWindowTo(150)
    expect(result.current).toBe(false)
  })

  it('returns true after scrolling past the threshold', () => {
    const { result } = renderHook(() => useScrollPast(150))

    scrollWindowTo(151)
    expect(result.current).toBe(true)

    scrollWindowTo(0)
    expect(result.current).toBe(false)
  })

  it('removes the scroll listener on unmount', () => {
    const addSpy = vi.spyOn(window, 'addEventListener')
    const removeSpy = vi.spyOn(window, 'removeEventListener')
    const { unmount } = renderHook(() => useScrollPast(150))
    const [, scrollHandler] = addSpy.mock.calls.find(([type]) => type === 'scroll')

    unmount()

    expect(removeSpy).toHaveBeenCalledWith('scroll', scrollHandler)
  })
})
