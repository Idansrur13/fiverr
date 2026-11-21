import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Search } from 'lucide-react'
import { setFilterBy } from '../store/gig.actions'
import { utilService } from '../services/util.service'

export function SearchBar() {
  const filterTxt = useSelector((storeState) => storeState.gigModule.filterBy.txt)
  const [txt, setTxt] = useState(filterTxt)
  const navigate = useNavigate()

  function onSubmit(ev) {
    ev.preventDefault()
    setFilterBy({ txt: txt.trim(), category: '' })
    navigate(utilService.getExploreUrl({ txt }))
  }

  return (
    <form className="search-bar" role="search" onSubmit={onSubmit}>
      <input
        type="search"
        aria-label="Search services"
        placeholder="What service are you looking for today?"
        value={txt}
        onChange={(ev) => setTxt(ev.target.value)}
      />
      <button type="submit" aria-label="Search">
        <Search size={18} />
      </button>
    </form>
  )
}
