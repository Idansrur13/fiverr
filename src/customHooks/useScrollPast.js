import { useEffect, useState } from 'react'

export function useScrollPast(threshold) {
  const [isScrolledPast, setIsScrolledPast] = useState(() => window.scrollY > threshold)

  useEffect(() => {
    function handleScroll() {
      setIsScrolledPast(window.scrollY > threshold)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold])

  return isScrolledPast
}
