export function PackageSelector({ packages, selectedIdx, onSelect }) {
  return (
    <div className="package-selector" role="group" aria-label="Packages">
      {packages.map((pkg, idx) => (
        <button
          key={pkg.id || pkg.tier || idx}
          type="button"
          aria-pressed={idx === selectedIdx}
          onClick={() => onSelect(idx)}
        >
          {pkg.title || pkg.tier}
        </button>
      ))}
    </div>
  )
}
