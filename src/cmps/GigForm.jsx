import { useState } from 'react'

const TITLE_MAX_LENGTH = 80

export function GigForm({ onSave }) {
  const [fields, setFields] = useState({ title: '', price: '' })
  const [errors, setErrors] = useState({})

  function handleChange({ target }) {
    setFields((prevFields) => ({ ...prevFields, [target.name]: target.value }))
    setErrors((prevErrors) => ({ ...prevErrors, [target.name]: '' }))
  }

  function handleSubmit(ev) {
    ev.preventDefault()
    const newErrors = validate(fields)
    setErrors(newErrors)
    if (Object.values(newErrors).some(Boolean)) return
    onSave({ title: fields.title.trim(), price: +fields.price })
  }

  return (
    <form className="gig-form" onSubmit={handleSubmit} noValidate>
      <div className="form-field">
        <label htmlFor="gig-title">Gig title</label>
        <div className="field-input">
          <textarea
            id="gig-title"
            name="title"
            rows="2"
            placeholder="I will do something I'm really good at"
            value={fields.title}
            onChange={handleChange}
            aria-invalid={!!errors.title}
            aria-describedby="gig-title-error"
          />
          <div className="field-footer">
            <p id="gig-title-error" className="field-error" role="alert">
              {errors.title}
            </p>
            <span className="char-count">
              {fields.title.length} / {TITLE_MAX_LENGTH} max
            </span>
          </div>
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="gig-price">Price ($)</label>
        <div className="field-input">
          <input
            id="gig-price"
            name="price"
            type="number"
            min="1"
            step="any"
            placeholder="5"
            value={fields.price}
            onChange={handleChange}
            aria-invalid={!!errors.price}
            aria-describedby="gig-price-error"
          />
          <p id="gig-price-error" className="field-error" role="alert">
            {errors.price}
          </p>
        </div>
      </div>

      <button type="submit" className="save-btn">
        Save
      </button>
    </form>
  )
}

function validate({ title, price }) {
  const errors = { title: '', price: '' }
  const trimmedTitle = title.trim()
  if (!trimmedTitle) errors.title = 'Title is required'
  else if (trimmedTitle.length > TITLE_MAX_LENGTH) {
    errors.title = `Title must be ${TITLE_MAX_LENGTH} characters or less`
  }
  if (!(+price > 0)) errors.price = 'Price must be a positive number'
  return errors
}
