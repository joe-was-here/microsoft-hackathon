from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from models import Recipe
from services.anthropic import generate_recipe_suggestions

router = APIRouter(prefix="/recipes", tags=["recipes"])


class SuggestRequest(BaseModel):
    ingredients: list[str] = Field(default_factory=list)


@router.get("/")
async def list_recipes() -> list[dict]:
    # Placeholder: will query Supabase and/or generate via Anthropic.
    return []


@router.post("/suggest")
async def suggest_recipes(payload: SuggestRequest) -> list[Recipe]:
    """Generate 3-5 recipe suggestions from a confirmed ingredient list."""
    ingredients = [item.strip() for item in payload.ingredients if item.strip()]
    if not ingredients:
        raise HTTPException(status_code=400, detail="No ingredients provided.")

    try:
        raw_recipes = generate_recipe_suggestions(ingredients)
    except RuntimeError as error:
        # Missing credentials / configuration.
        raise HTTPException(status_code=503, detail=str(error)) from error
    except ValueError as error:
        # Model returned something we could not parse.
        raise HTTPException(status_code=502, detail=str(error)) from error

    recipes: list[Recipe] = []
    for raw in raw_recipes:
        raw.setdefault("source", "suggested")
        recipes.append(Recipe.model_validate(raw))
    return recipes
