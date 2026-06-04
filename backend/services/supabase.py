from functools import lru_cache
import logging

from supabase import Client, create_client

from config import settings


logger = logging.getLogger(__name__)


@lru_cache
def get_supabase_client() -> Client:
    """Return a cached Supabase client.

    Requires SUPABASE_URL and SUPABASE_KEY to be set in the environment.
    """
    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        logger.error(
            "Supabase credentials missing: SUPABASE_URL set=%s SUPABASE_KEY set=%s",
            bool(settings.SUPABASE_URL),
            bool(settings.SUPABASE_KEY),
        )
        raise RuntimeError(
            "Supabase credentials are missing. Set SUPABASE_URL and SUPABASE_KEY."
        )
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)


def supabase_configured() -> bool:
    """Return True when both Supabase credentials are present."""
    return bool(settings.SUPABASE_URL and settings.SUPABASE_KEY)


def find_recipes_by_ingredients(ingredients: list[str], limit: int = 5) -> list[dict]:
    """Return stored recipes that share at least one ingredient with the input.

    Recipes are ranked by how many of the requested ingredients they use, so
    the closest matches come first. Returns an empty list when nothing matches.
    """
    wanted = {item.strip().lower() for item in ingredients if item.strip()}
    if not wanted:
        return []

    response = (
        get_supabase_client()
        .table("recipes")
        .select("*")
        .limit(200)
        .execute()
    )
    rows = response.data or []

    scored: list[tuple[int, dict]] = []
    for row in rows:
        names: set[str] = set()
        for ingredient in row.get("ingredients") or []:
            name = ingredient.get("name", "") if isinstance(ingredient, dict) else str(ingredient)
            if name:
                names.add(name.strip().lower())
        overlap = len(wanted & names)
        if overlap:
            scored.append((overlap, row))

    scored.sort(key=lambda pair: pair[0], reverse=True)
    return [row for _, row in scored[:limit]]
