import { useRef } from 'react'
import { Check, Clock, Info } from 'lucide-react'

function getTierLabel(pkg, idx) {
  const tier = pkg?.tier || pkg?.level || pkg?.label
  if (tier) {
    return String(tier)
      .toLowerCase()
      .replace(/[_-]+/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())
  }
  if (pkg?.title) {
    const title = String(pkg.title).trim()
    if (/^(basic|standard|premium)$/i.test(title))
      return title[0].toUpperCase() + title.slice(1).toLowerCase()
  }
  return ['Basic', 'Standard', 'Premium'][idx] || `Package ${idx + 1}`
}

function getRevisions(pkg) {
  const value = pkg?.revisions ?? pkg?.revisionCount ?? pkg?.revisionsCount
  return value === undefined || value === null ? 0 : value
}

export function PackageSelector({ packages = [], selectedIdx = 0, onSelect = () => {} }) {
  const tabRefs = useRef([])
  const safePackages = packages.filter(Boolean)
  const safeIdx = safePackages.length
    ? Math.min(Math.max(selectedIdx, 0), safePackages.length - 1)
    : 0
  const selectedPkg = safePackages[safeIdx]

  function selectAndFocus(idx) {
    onSelect(idx)
    tabRefs.current[idx]?.focus()
  }

  function handleKeyDown(event, idx) {
    let nextIdx
    if (event.key === 'ArrowRight') nextIdx = (idx + 1) % safePackages.length
    else if (event.key === 'ArrowLeft')
      nextIdx = (idx - 1 + safePackages.length) % safePackages.length
    else if (event.key === 'Home') nextIdx = 0
    else if (event.key === 'End') nextIdx = safePackages.length - 1
    else return

    event.preventDefault()
    selectAndFocus(nextIdx)
  }

  if (!selectedPkg) return null

  const title = selectedPkg.title || getTierLabel(selectedPkg, safeIdx)
  const price = selectedPkg.price
  const daysToMake = selectedPkg.daysToMake ?? selectedPkg.deliveryDays
  const features = Array.isArray(selectedPkg.features) ? selectedPkg.features : []
  const description = selectedPkg.description

  return (
    <div className="package-selector">
      {safePackages.length > 1 && (
        <div className="package-selector-tabs" role="tablist" aria-label="Packages">
          {safePackages.map((pkg, idx) => {
            const label = getTierLabel(pkg, idx)
            return (
              <button
                key={pkg.id || pkg.tier || idx}
                ref={(element) => {
                  tabRefs.current[idx] = element
                }}
                id={`package-tab-${idx}`}
                type="button"
                role="tab"
                aria-selected={idx === safeIdx}
                aria-controls="selected-package-panel"
                tabIndex={idx === safeIdx ? 0 : -1}
                onClick={() => onSelect(idx)}
                onKeyDown={(event) => handleKeyDown(event, idx)}
              >
                {label}
              </button>
            )
          })}
        </div>
      )}

      <div
        id="selected-package-panel"
        className="package-selector-details"
        role="tabpanel"
        aria-labelledby={safePackages.length > 1 ? `package-tab-${safeIdx}` : undefined}
      >
        <h2 className="package-selector-title">{title}</h2>
        {price !== undefined && (
          <>
            <div className="package-selector-price-row">
              <span className="package-selector-price">${Number(price).toFixed(0)}</span>
              <span className="package-selector-info" aria-label="Price information">
                <Info size={14} />
              </span>
            </div>
            <p className="package-selector-tax-note">Includes taxes and service fees</p>
          </>
        )}
        {description && <p className="package-selector-description">{description}</p>}
        {daysToMake !== undefined && (
          <p className="package-selector-delivery">
            <Clock size={16} />
            <strong>{daysToMake}-day delivery</strong>
          </p>
        )}
        <p className="package-selector-revisions">{getRevisions(selectedPkg)} revisions</p>
        {features.length > 0 && (
          <ul className="package-selector-features">
            {features.map((feature, idx) => (
              <li key={`${feature}-${idx}`}>
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
