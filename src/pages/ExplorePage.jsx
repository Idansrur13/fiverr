import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { GigList } from '../cmps/GigList'
import { GigFilter } from '../cmps/GigFilter'
import { SortBy } from '../cmps/SortBy'
import { Pagination } from '../cmps/Pagination'
import { loadGigsPage } from '../store/gig.actions'
import { categoryService } from '../services/category.service'
import { useFilterSearchParams } from '../customHooks/useFilterSearchParams'

export function ExplorePage() {
  const [filterBy, setFilterParams] = useFilterSearchParams()
  const gigs = useSelector((storeState) => storeState.gigModule.gigs)
  const { total, page, pageCount } = useSelector((storeState) => storeState.gigModule.pageInfo)
  const pageRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let ignore = false

    async function onLoadGigs() {
      setIsLoading(true)
      setHasError(false)
      try {
        await loadGigsPage(filterBy)
      } catch {
        if (!ignore) setHasError(true)
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    onLoadGigs()
    return () => {
      ignore = true
    }
  }, [filterBy])

  // Page 1 isn't written to the URL, like every other default
  function onChangePage(newPage) {
    setFilterParams({ page: newPage > 1 ? String(newPage) : '' })
    pageRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section className="explore-page" ref={pageRef}>
      <h1>{getTitle(filterBy)}</h1>
      <div className="explore-page-toolbar">
        <GigFilter filterBy={filterBy} onSetFilter={setFilterParams} />
        <SortBy filterBy={filterBy} onSetFilter={setFilterParams} />
      </div>
      {isLoading && <p className="explore-page-status">Loading…</p>}
      {!isLoading && hasError && (
        <p className="explore-page-status error">Couldn't load services. Please try again.</p>
      )}
      {!isLoading && !hasError && (
        <>
          <p className="explore-page-count">
            {total} {total === 1 ? 'service' : 'services'} available
          </p>
          <GigList gigs={gigs} />
          <Pagination page={page} pageCount={pageCount} onChangePage={onChangePage} />
        </>
      )}
    </section>
  )
}

function getTitle({ txt, category }) {
  if (txt) return `Results for "${txt}"`
  if (category) return categoryService.getCategoryName(category)
  return 'Explore'
}
