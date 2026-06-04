import './RecipeCard.css'

function RecipeCard({ recipe, onSave, needsGroceries = false }) {
  if (!recipe) return null

  const { title, time, ingredients = [], steps = [] } = recipe

  return (
    <article className="recipe-card">
      <header className="recipe-card__header">
        <h2 className="recipe-card__title">{title}</h2>
        <div className="recipe-card__badges">
          {time && <span className="recipe-card__badge">⏱ {time}</span>}
          {needsGroceries && (
            <span className="recipe-card__badge recipe-card__badge--groceries">
              Needs groceries
            </span>
          )}
        </div>
      </header>

      {ingredients.length > 0 && (
        <section className="recipe-card__section">
          <h3 className="recipe-card__subtitle">Ingredients</h3>
          <ul className="recipe-card__ingredients">
            {ingredients.map((ingredient) => (
              <li key={ingredient}>{ingredient}</li>
            ))}
          </ul>
        </section>
      )}

      {steps.length > 0 && (
        <section className="recipe-card__section">
          <h3 className="recipe-card__subtitle">Steps</h3>
          <ol className="recipe-card__steps">
            {steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </section>
      )}

      <button
        type="button"
        className="recipe-card__save"
        onClick={() => onSave?.(recipe)}
      >
        Save recipe
      </button>
    </article>
  )
}

export default RecipeCard
