import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { BudgetFilter } from './BudgetFilter'
import { DeliveryFilter } from './DeliveryFilter'

const PANELS = [
  { id: 'budget', label: 'Budget', cmp: BudgetFilter },
  { id: 'delivery', label: 'Delivery time', cmp: DeliveryFilter },
]

const MOBILE_QUERY = '(max-width: 600px)'

export function GigFilter({ filterBy, onSetFilter }) {
  const [openPanelId, setOpenPanelId] = useState(null)
  const filterRef = useRef(null)
  const panelRef = useRef(null)
  const buttonRefs = useRef({})

  const activePanels = {
    budget: Boolean(filterBy.minPrice || filterBy.maxPrice),
    delivery: Boolean(filterBy.daysToMake),
  }

  function closePanel({ returnFocus = true } = {}) {
    if (returnFocus && openPanelId) buttonRefs.current[openPanelId]?.focus()
    setOpenPanelId(null)
  }

  // Close on outside click (focus stays where the user clicked) or on Escape
  useEffect(() => {
    if (!openPanelId) return

    function onMouseDown(ev) {
      if (!filterRef.current?.contains(ev.target)) setOpenPanelId(null)
    }
    function onKeyDown(ev) {
      if (ev.key !== 'Escape') return
      buttonRefs.current[openPanelId]?.focus()
      setOpenPanelId(null)
    }

    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [openPanelId])

  // Move focus into the panel when it opens
  useEffect(() => {
    if (!openPanelId) return
    panelRef.current?.querySelector('input, button')?.focus()
  }, [openPanelId])

  // On mobile the panel is a bottom sheet, so the page behind it must not scroll
  useEffect(() => {
    if (!openPanelId || !window.matchMedia?.(MOBILE_QUERY).matches) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
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
              ref={(el) => (buttonRefs.current[id] = el)}
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
                  onMouseDown={() => closePanel({ returnFocus: false })}
                />
                <div className="filter-panel" role="dialog" aria-label={label} ref={panelRef}>
                  <h3 className="filter-panel-title">{label}</h3>
                  <PanelCmp
                    filterBy={filterBy}
                    onSetFilter={onSetFilter}
                    onClose={() => closePanel()}
                  />
                </div>
              </>
            )}
          </div>
        )
      })}
    </section>
  )
}
