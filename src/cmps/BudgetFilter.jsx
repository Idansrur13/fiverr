import { useState } from 'react'
import { useSelector } from 'react-redux'
import { setFilterBy } from '../store/gig.actions'

export function BudgetFilter({ onClose }) {
  const filterBy = useSelector((storeState) => storeState.gigModule.filterBy)
  const [minPrice, setMinPrice] = useState(filterBy.minPrice)
  const [maxPrice, setMaxPrice] = useState(filterBy.maxPrice)
  const isInvalid = minPrice !== '' && maxPrice !== '' && +minPrice > +maxPrice

  function onApply(ev) {
    ev.preventDefault()
    if (isInvalid) return
    setFilterBy({ minPrice, maxPrice })
    onClose()
  }

  function onClear() {
    setFilterBy({ minPrice: '', maxPrice: '' })
    onClose()
  }

  return (
    <form className="filter-panel-form" onSubmit={onApply}>
      <div className="budget-filter-fields">
        <label>
          <span>Min.</span>
          <input
            type="number"
            min="0"
            placeholder="Any"
            value={minPrice}
            onChange={(ev) => setMinPrice(ev.target.value)}
          />
        </label>
        <label>
          <span>Max.</span>
          <input
            type="number"
            min="0"
            placeholder="Any"
            value={maxPrice}
            onChange={(ev) => setMaxPrice(ev.target.value)}
          />
        </label>
      </div>
      {isInvalid && (
        <p className="filter-panel-error" role="alert">
          Min price can't be higher than max price
        </p>
      )}
      <div className="filter-panel-actions">
        <button type="button" className="filter-panel-clear" onClick={onClear}>
          Clear all
        </button>
        <button type="submit" className="filter-panel-apply" disabled={isInvalid}>
          Apply
        </button>
      </div>
    </form>
  )
}
