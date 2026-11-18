import { useNavigate } from 'react-router-dom'
import { GigForm } from '../cmps/GigForm'
import { gigService } from '../services/gig.service'
import { saveGig } from '../store/gig.actions'

export function GigEditPage() {
  const navigate = useNavigate()

  async function onSave({ title, price }) {
    await saveGig({ ...gigService.getEmptyGig(), title, price })
    navigate('/explore')
  }

  return (
    <section className="gig-edit-page">
      <h1>Create a new gig</h1>
      <GigForm onSave={onSave} />
    </section>
  )
}
