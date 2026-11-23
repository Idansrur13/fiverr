import { useState } from 'react'

export function BudgetFilter({ filterBy, onSetFilter, onClose }) {
  const [minPrice, setMinPrice] = useState(filterBy.minPrice)
  const [maxPrice, setMaxPrice] = useState(filterBy.maxPrice)
  const [isErrorShown, setIsErrorShown] = useState(false)
  const isInvalid = minPrice !== '' && maxPrice !== '' && +minPrice > +maxPrice

  function onApply(ev) {
    ev.preventDefault()
    if (isInvalid) {
      setIsErrorShown(true)
      return
    }
    onSetFilter({ minPrice, maxPrice })
    onClose()
  }

  function onClear() {
    onSetFilter({ minPrice: '', maxPrice: '' })
    onClose()
  }

  function onFieldChange(setPrice, value) {
    setPrice(value)
    setIsErrorShown(false)
  }

  // The error shows only after leaving a field, not in the middle of typing
  function onFieldBlur() {
    setIsErrorShown(true)
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
            onChange={(ev) => onFieldChange(setMinPrice, ev.target.value)}
            onBlur={onFieldBlur}
          />
        </label>
        <label>
          <span>Max.</span>
          <input
            type="number"
            min="0"
            placeholder="Any"
            value={maxPrice}
            onChange={(ev) => onFieldChange(setMaxPrice, ev.target.value)}
            onBlur={onFieldBlur}
          />
        </label>
      </div>
      {isInvalid && isErrorShown && (
        <p className="filter-panel-error" role="alert">
          Min price can't be higher than max price
        </p>
      )}
      <div className="filter-panel-actions">
        <button type="button" className="filter-panel-clear" onClick={onClear}>
          Clear
        </button>
        <button type="submit" className="filter-panel-apply" disabled={isInvalid}>
          Apply
        </button>
      </div>
    </form>
  )
}
