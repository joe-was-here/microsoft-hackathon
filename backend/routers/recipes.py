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


@router.get("")
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


@router.get("/{recipe_id}")
async def get_recipe(recipe_id: str) -> dict:
    try:
        id_lookup = (
            get_supabase_client()
            .table("recipes")
            .select("*")
            .eq("id", recipe_id)
            .limit(1)
            .execute()
        )
        if id_lookup.data:
            return id_lookup.data[0]

        title_lookup = (
            get_supabase_client()
            .table("recipes")
            .select("*")
            .eq("title", recipe_id)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        if title_lookup.data:
            return title_lookup.data[0]

        raise HTTPException(status_code=404, detail="Recipe not found")
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to fetch recipe %s", recipe_id)
        raise HTTPException(status_code=500, detail="Failed to fetch recipe") from exc


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
