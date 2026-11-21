import { useState } from 'react'

export function PackageSelector(props) {
  const { packages = [] } = props
  const packagesKey = packages
    .map((pkg, idx) => pkg.id || pkg.packageId || pkg.tier || `${pkg.title}-${idx}`)
    .join('|')

  return <PackageSelectorState key={packagesKey} {...props} packages={packages} />
}

function PackageSelectorState({ packages, children, onSelectionChange }) {
  const [selectedIdx, setSelectedIdx] = useState(0)
  const activeIdx = selectedIdx < packages.length ? selectedIdx : 0
  const selectedPackage = packages[activeIdx] ?? packages[0] ?? null

  function handleSelect(idx) {
    setSelectedIdx(idx)
    onSelectionChange?.()
  }

  return (
    <>
      {packages.length > 1 && (
        <div className="order-card-tabs" role="group" aria-label="Package selection">
          {packages.map((pkg, idx) => (
            <button
              key={pkg.id || pkg.packageId || pkg.tier || idx}
              type="button"
              className={`order-card-tab ${idx === activeIdx ? 'active' : ''}`}
              aria-pressed={idx === activeIdx}
              onClick={() => handleSelect(idx)}
            >
              {pkg.title || pkg.tier}
            </button>
          ))}
        </div>
      )}
      {typeof children === 'function' ? children(selectedPackage) : children}
    </>
  )
}
