import { useState } from 'react'
import './IngredientReview.css'

function normalize(value) {
  return value.trim()
}

function IngredientReview({ ingredients = [], onConfirm }) {
  const [items, setItems] = useState(ingredients)
  const [newItem, setNewItem] = useState('')

  function removeItem(target) {
    setItems((current) => current.filter((item) => item !== target))
  }

  function addItem() {
    const value = normalize(newItem)
    if (!value) return
    const exists = items.some(
      (item) => item.toLowerCase() === value.toLowerCase(),
    )
    if (!exists) {
      setItems((current) => [...current, value])
    }
    setNewItem('')
  }

  function handleInputKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault()
      addItem()
    }
  }

  return (
    <div className="ingredient-review">
      <h2 className="ingredient-review__title">Review ingredients</h2>
      <p className="ingredient-review__hint">
        Remove anything that looks wrong and add anything we missed.
      </p>

      {items.length > 0 ? (
        <ul className="ingredient-review__chips">
          {items.map((item) => (
            <li key={item} className="ingredient-review__chip">
              <span>{item}</span>
              <button
                type="button"
                className="ingredient-review__chip-remove"
                aria-label={`Remove ${item}`}
                onClick={() => removeItem(item)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="ingredient-review__empty">No ingredients yet — add some below.</p>
      )}

      <div className="ingredient-review__add">
        <input
          type="text"
          className="ingredient-review__input"
          placeholder="Add an ingredient"
          aria-label="Add an ingredient"
          value={newItem}
          onChange={(event) => setNewItem(event.target.value)}
          onKeyDown={handleInputKeyDown}
        />
        <button
          type="button"
          className="ingredient-review__add-button"
          onClick={addItem}
          disabled={!normalize(newItem)}
        >
          Add
        </button>
      </div>

      <button
        type="button"
        className="ingredient-review__confirm"
        onClick={() => onConfirm?.(items)}
        disabled={items.length === 0}
      >
        Confirm ingredients
      </button>
    </div>
  )
}

export default IngredientReview
