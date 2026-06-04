import { useState } from 'react'
import { createRecipe, updateRecipe } from '../lib/api'
import './ManualRecipeForm.css'

const EMPTY_INGREDIENT = { name: '', amount: '', unit: '' }

function toFormState(recipe) {
  if (!recipe) {
    return {
      title: '',
      ingredients: [{ ...EMPTY_INGREDIENT }],
      steps: [''],
      mealType: '',
      flavorTags: '',
    }
  }

  const ingredients =
    Array.isArray(recipe.ingredients) && recipe.ingredients.length
      ? recipe.ingredients.map((ingredient) => ({
          name: ingredient?.name ?? '',
          amount: ingredient?.amount ?? '',
          unit: ingredient?.unit ?? '',
        }))
      : [{ ...EMPTY_INGREDIENT }]

  const steps =
    Array.isArray(recipe.steps) && recipe.steps.length ? [...recipe.steps] : ['']

  const flavorTags = Array.isArray(recipe.flavor_tags)
    ? recipe.flavor_tags.join(', ')
    : ''

  return {
    title: recipe.title ?? '',
    ingredients,
    steps,
    mealType: recipe.meal_type ?? '',
    flavorTags,
  }
}

function buildPayload({ title, ingredients, steps, mealType, flavorTags, source }) {
  const cleanedIngredients = ingredients
    .map((ingredient) => ({
      name: ingredient.name.trim(),
      amount: ingredient.amount.trim(),
      unit: ingredient.unit.trim(),
    }))
    .filter((ingredient) => ingredient.name)

  const cleanedSteps = steps.map((step) => step.trim()).filter(Boolean)

  const cleanedTags = flavorTags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)

  const payload = {
    title: title.trim(),
    ingredients: cleanedIngredients,
    steps: cleanedSteps,
    flavor_tags: cleanedTags,
    source: source ?? 'manual',
  }

  if (mealType.trim()) payload.meal_type = mealType.trim()

  return payload
}

function validate(payload) {
  const errors = {}
  if (!payload.title) errors.title = 'Add a title.'
  if (payload.ingredients.length === 0) {
    errors.ingredients = 'Add at least one ingredient.'
  }
  if (payload.steps.length === 0) errors.steps = 'Add at least one step.'
  return errors
}

function ManualRecipeForm({ onCreated, initialRecipe = null, onUpdated, onCancel }) {
  const isEditing = Boolean(initialRecipe)
  const initialState = toFormState(initialRecipe)
  const [title, setTitle] = useState(initialState.title)
  const [ingredients, setIngredients] = useState(initialState.ingredients)
  const [steps, setSteps] = useState(initialState.steps)
  const [mealType, setMealType] = useState(initialState.mealType)
  const [flavorTags, setFlavorTags] = useState(initialState.flavorTags)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | saving | success | error
  const [submitError, setSubmitError] = useState(null)

  function updateIngredient(index, field, value) {
    setIngredients((current) =>
      current.map((ingredient, position) =>
        position === index ? { ...ingredient, [field]: value } : ingredient,
      ),
    )
  }

  function addIngredient() {
    setIngredients((current) => [...current, { ...EMPTY_INGREDIENT }])
  }

  function removeIngredient(index) {
    setIngredients((current) =>
      current.length === 1
        ? current
        : current.filter((_, position) => position !== index),
    )
  }

  function updateStep(index, value) {
    setSteps((current) =>
      current.map((step, position) => (position === index ? value : step)),
    )
  }

  function addStep() {
    setSteps((current) => [...current, ''])
  }

  function removeStep(index) {
    setSteps((current) =>
      current.length === 1
        ? current
        : current.filter((_, position) => position !== index),
    )
  }

  function resetForm() {
    setTitle('')
    setIngredients([{ ...EMPTY_INGREDIENT }])
    setSteps([''])
    setMealType('')
    setFlavorTags('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitError(null)

    const payload = buildPayload({
      title,
      ingredients,
      steps,
      mealType,
      flavorTags,
      source: initialRecipe?.source ?? 'manual',
    })
    const validationErrors = validate(payload)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) {
      setStatus('idle')
      return
    }

    setStatus('saving')
    try {
      if (isEditing) {
        const saved = await updateRecipe(initialRecipe.id, payload)
        setStatus('success')
        onUpdated?.(saved ?? { ...initialRecipe, ...payload })
      } else {
        const saved = await createRecipe(payload)
        setStatus('success')
        resetForm()
        onCreated?.(saved ?? payload)
      }
    } catch (caught) {
      setStatus('error')
      setSubmitError(
        caught instanceof Error
          ? caught.message
          : 'Something went wrong saving your recipe.',
      )
    }
  }

  return (
    <form className="manual-recipe" onSubmit={handleSubmit} noValidate>
      <div className="manual-recipe__field">
        <label htmlFor="manual-title">Title</label>
        <input
          id="manual-title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Grandma's lasagna"
        />
        {errors.title && (
          <p className="manual-recipe__error" role="alert">
            {errors.title}
          </p>
        )}
      </div>

      <fieldset className="manual-recipe__group">
        <legend>Ingredients</legend>
        {ingredients.map((ingredient, index) => (
          <div className="manual-recipe__ingredient" key={index}>
            <input
              type="text"
              aria-label={`Ingredient ${index + 1} name`}
              value={ingredient.name}
              onChange={(event) => updateIngredient(index, 'name', event.target.value)}
              placeholder="Name"
            />
            <input
              type="text"
              aria-label={`Ingredient ${index + 1} amount`}
              value={ingredient.amount}
              onChange={(event) => updateIngredient(index, 'amount', event.target.value)}
              placeholder="Amount"
            />
            <input
              type="text"
              aria-label={`Ingredient ${index + 1} unit`}
              value={ingredient.unit}
              onChange={(event) => updateIngredient(index, 'unit', event.target.value)}
              placeholder="Unit"
            />
            <button
              type="button"
              className="manual-recipe__remove"
              onClick={() => removeIngredient(index)}
              aria-label={`Remove ingredient ${index + 1}`}
              disabled={ingredients.length === 1}
            >
              ×
            </button>
          </div>
        ))}
        {errors.ingredients && (
          <p className="manual-recipe__error" role="alert">
            {errors.ingredients}
          </p>
        )}
        <button type="button" className="manual-recipe__add" onClick={addIngredient}>
          + Add ingredient
        </button>
      </fieldset>

      <fieldset className="manual-recipe__group">
        <legend>Steps</legend>
        {steps.map((step, index) => (
          <div className="manual-recipe__step" key={index}>
            <textarea
              aria-label={`Step ${index + 1}`}
              value={step}
              onChange={(event) => updateStep(index, event.target.value)}
              placeholder={`Step ${index + 1}`}
              rows={2}
            />
            <button
              type="button"
              className="manual-recipe__remove"
              onClick={() => removeStep(index)}
              aria-label={`Remove step ${index + 1}`}
              disabled={steps.length === 1}
            >
              ×
            </button>
          </div>
        ))}
        {errors.steps && (
          <p className="manual-recipe__error" role="alert">
            {errors.steps}
          </p>
        )}
        <button type="button" className="manual-recipe__add" onClick={addStep}>
          + Add step
        </button>
      </fieldset>

      <div className="manual-recipe__field">
        <label htmlFor="manual-meal-type">Meal type</label>
        <input
          id="manual-meal-type"
          type="text"
          value={mealType}
          onChange={(event) => setMealType(event.target.value)}
          placeholder="Dinner"
        />
      </div>

      <div className="manual-recipe__field">
        <label htmlFor="manual-flavor-tags">Flavor tags</label>
        <input
          id="manual-flavor-tags"
          type="text"
          value={flavorTags}
          onChange={(event) => setFlavorTags(event.target.value)}
          placeholder="comfort, savory, italian"
        />
        <p className="manual-recipe__hint">Separate tags with commas.</p>
      </div>

      {status === 'success' && (
        <p className="manual-recipe__success" role="status">
          {isEditing ? 'Recipe updated.' : 'Recipe saved to My Recipes.'}
        </p>
      )}

      {status === 'error' && submitError && (
        <p className="manual-recipe__error" role="alert">
          {submitError}
        </p>
      )}

      <div className="manual-recipe__actions">
        {isEditing && onCancel && (
          <button
            type="button"
            className="manual-recipe__cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
        <button type="submit" className="manual-recipe__submit" disabled={status === 'saving'}>
          {status === 'saving'
            ? 'Saving…'
            : isEditing
              ? 'Save changes'
              : 'Save recipe'}
        </button>
      </div>
    </form>
  )
}

export default ManualRecipeForm
