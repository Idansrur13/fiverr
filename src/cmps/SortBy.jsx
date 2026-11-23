const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'best-selling', label: 'Best selling' },
  { value: 'newest', label: 'Newest arrivals' },
]

// recommended is the default, so it's sent as '' and never written to the URL
export function SortBy({ filterBy, onSetFilter }) {
  function onChange(ev) {
    const { value } = ev.target
    onSetFilter({ sortBy: value === 'recommended' ? '' : value })
  }

  return (
    <label className="sort-by">
      <span>Sort by:</span>
      <select value={filterBy.sortBy || 'recommended'} onChange={onChange}>
        {SORT_OPTIONS.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </label>
  )
}
