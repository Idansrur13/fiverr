import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { ChevronDown } from 'lucide-react'
import { BudgetFilter } from './BudgetFilter'
import { DeliveryFilter } from './DeliveryFilter'

const PANELS = [
  { id: 'budget', label: 'Budget', cmp: BudgetFilter },
  { id: 'delivery', label: 'Delivery time', cmp: DeliveryFilter },
]

export function GigFilter() {
  const filterBy = useSelector((storeState) => storeState.gigModule.filterBy)
  const [openPanelId, setOpenPanelId] = useState(null)
  const filterRef = useRef(null)

  const activePanels = {
    budget: Boolean(filterBy.minPrice || filterBy.maxPrice),
    delivery: Boolean(filterBy.daysToMake),
  }

  useEffect(() => {
    if (!openPanelId) return

    function onMouseDown(ev) {
      if (!filterRef.current?.contains(ev.target)) setOpenPanelId(null)
    }
    function onKeyDown(ev) {
      if (ev.key === 'Escape') setOpenPanelId(null)
    }

    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [openPanelId])

  function onToggle(panelId) {
    setOpenPanelId((prevId) => (prevId === panelId ? null : panelId))
  }

  return (
    <section className="gig-filter" ref={filterRef}>
      {PANELS.map(({ id, label, cmp }) => {
        const PanelCmp = cmp
        return (
          <div key={id} className="gig-filter-item">
            <button
              type="button"
              className={`gig-filter-btn ${activePanels[id] ? 'active' : ''}`}
              aria-expanded={openPanelId === id}
              onClick={() => onToggle(id)}
            >
              {label}
              <ChevronDown size={16} aria-hidden="true" />
            </button>
            {openPanelId === id && (
              <>
                <div
                  className="gig-filter-backdrop"
                  aria-hidden="true"
                  onMouseDown={() => setOpenPanelId(null)}
                />
                <div className="filter-panel" role="dialog" aria-label={label}>
                  <h3 className="filter-panel-title">{label}</h3>
                  <PanelCmp onClose={() => setOpenPanelId(null)} />
                </div>
              </>
            )}
          </div>
        )
      })}
    </section>
  )
}
