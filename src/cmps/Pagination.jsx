import { ChevronLeft, ChevronRight } from 'lucide-react'

export function Pagination({ page, pageCount, onChangePage }) {
  if (pageCount <= 1) return null

  const pages = Array.from({ length: pageCount }, (_, idx) => idx + 1)

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        type="button"
        className="pagination-step"
        aria-label="Previous page"
        disabled={page <= 1}
        onClick={() => onChangePage(page - 1)}
      >
        <ChevronLeft size={20} />
      </button>
      <ul>
        {pages.map((pageNum) => (
          <li key={pageNum}>
            <button
              type="button"
              className={pageNum === page ? 'active' : ''}
              aria-current={pageNum === page ? 'page' : undefined}
              onClick={() => onChangePage(pageNum)}
            >
              {pageNum}
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="pagination-step"
        aria-label="Next page"
        disabled={page >= pageCount}
        onClick={() => onChangePage(page + 1)}
      >
        <ChevronRight size={20} />
      </button>
    </nav>
  )
}
