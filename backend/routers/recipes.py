import logging

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from models import Recipe
from services.anthropic import generate_recipe_suggestions
from services.supabase import get_supabase_client


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/recipes", tags=["recipes"])


class SuggestRequest(BaseModel):
    ingredients: list[str] = Field(default_factory=list)


@router.get("/")
async def list_recipes(limit: int = Query(default=20, ge=1, le=100)) -> list[dict]:
    try:
        response = (
            get_supabase_client()
            .table("recipes")
            .select("*")
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        return response.data or []
    except Exception as exc:
        logger.exception("Failed to fetch recipes from Supabase")
        raise HTTPException(status_code=500, detail="Failed to fetch recipes") from exc


@router.post("/", response_model=Recipe, status_code=201)
async def save_recipe(recipe: Recipe) -> Recipe:
    """Persist a recipe to Supabase and return it with its generated UUID."""
    data = recipe.model_dump(exclude={"id"})
    # Serialize nested structures so Supabase receives plain dicts/lists.
    data["ingredients"] = [ing.model_dump() for ing in recipe.ingredients]
    try:
        response = (
            get_supabase_client()
            .table("recipes")
            .insert(data)
            .execute()
        )
    except Exception as exc:
        logger.exception("Failed to save recipe to Supabase")
        raise HTTPException(status_code=500, detail="Failed to save recipe") from exc

    if not response.data:
        raise HTTPException(status_code=500, detail="Recipe insert returned no data")

    return Recipe.model_validate(response.data[0])


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
