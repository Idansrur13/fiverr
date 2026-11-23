import { useState } from 'react'

const DELIVERY_OPTIONS = [
  { label: 'Express 24H', value: '1' },
  { label: 'Up to 3 days', value: '3' },
  { label: 'Up to 7 days', value: '7' },
  { label: 'Anytime', value: '' },
]

export function DeliveryFilter({ filterBy, onSetFilter, onClose }) {
  const [daysToMake, setDaysToMake] = useState(String(filterBy.daysToMake))

  function onApply(ev) {
    ev.preventDefault()
    onSetFilter({ daysToMake })
    onClose()
  }

  function onClear() {
    onSetFilter({ daysToMake: '' })
    onClose()
  }

  return (
    <form className="filter-panel-form" onSubmit={onApply}>
      <fieldset className="delivery-filter-options" aria-label="Delivery time">
        {DELIVERY_OPTIONS.map(({ label, value }) => (
          <label key={label}>
            <input
              type="radio"
              name="daysToMake"
              value={value}
              checked={daysToMake === value}
              onChange={() => setDaysToMake(value)}
            />
            <span>{label}</span>
          </label>
        ))}
      </fieldset>
      <div className="filter-panel-actions">
        <button type="button" className="filter-panel-clear" onClick={onClear}>
          Clear
        </button>
        <button type="submit" className="filter-panel-apply">
          Apply
        </button>
      </div>
    </form>
  )
}
