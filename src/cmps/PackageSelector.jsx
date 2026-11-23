import { useRef } from 'react'
import { Check, Clock } from 'lucide-react'

const TIER_LABELS = {
  BASIC: 'Basic',
  STANDARD: 'Standard',
  PREMIUM: 'Premium',
}

export function PackageSelector({ packages, selectedIdx, onSelect }) {
  const tabRefs = useRef([])
  const selectedPkg = packages[selectedIdx]

  if (!selectedPkg) return null

  const { title, description, price, daysToMake, revisions, features = [] } = selectedPkg
  const hasTabs = packages.length > 1

  function selectAndFocus(idx) {
    onSelect(idx)
    tabRefs.current[idx]?.focus()
  }

  function handleKeyDown(event, idx) {
    const lastIdx = packages.length - 1
    const nextIdx = {
      ArrowRight: idx === lastIdx ? 0 : idx + 1,
      ArrowLeft: idx === 0 ? lastIdx : idx - 1,
      Home: 0,
      End: lastIdx,
    }[event.key]
    if (nextIdx === undefined) return

    event.preventDefault()
    selectAndFocus(nextIdx)
  }

  return (
    <div className="package-selector">
      {hasTabs && (
        <div className="package-selector-tabs" role="tablist" aria-label="Packages">
          {packages.map((pkg, idx) => (
            <button
              key={pkg.id}
              ref={(element) => {
                tabRefs.current[idx] = element
              }}
              id={`package-tab-${idx}`}
              type="button"
              role="tab"
              aria-selected={idx === selectedIdx}
              aria-controls="selected-package-panel"
              tabIndex={idx === selectedIdx ? 0 : -1}
              onClick={() => onSelect(idx)}
              onKeyDown={(event) => handleKeyDown(event, idx)}
            >
              {TIER_LABELS[pkg.tier] || pkg.title}
            </button>
          ))}
        </div>
      )}

      <div
        id="selected-package-panel"
        className="package-selector-details"
        role={hasTabs ? 'tabpanel' : undefined}
        aria-labelledby={hasTabs ? `package-tab-${selectedIdx}` : undefined}
      >
        {title && <h2 className="package-selector-title">{title}</h2>}
        <p className="package-selector-price">${price}</p>
        {description && <p className="package-selector-description">{description}</p>}
        <p className="package-selector-delivery">
          <Clock size={16} />
          <strong>{daysToMake}-day delivery</strong>
        </p>
        {revisions !== undefined && (
          <p className="package-selector-revisions">
            {revisions} {revisions === 1 ? 'revision' : 'revisions'}
          </p>
        )}
        {features.length > 0 && (
          <ul className="package-selector-features">
            {features.map((feature) => (
              <li key={feature}>
                <Check size={16} />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
