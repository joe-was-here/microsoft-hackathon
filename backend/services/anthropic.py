from functools import lru_cache
import json

from anthropic import Anthropic

from config import settings


@lru_cache
def get_anthropic_client() -> Anthropic:
    """Return a cached Anthropic client.

    Requires ANTHROPIC_API_KEY to be set in the environment.
    """
    if not settings.ANTHROPIC_API_KEY:
        raise RuntimeError(
            "Anthropic credentials are missing. Set ANTHROPIC_API_KEY."
        )
    return Anthropic(api_key=settings.ANTHROPIC_API_KEY)


def _extract_json_array(text: str) -> list[dict]:
    """Pull a JSON array out of a model response.

    Claude sometimes wraps JSON in prose or markdown fences, so fall back to
    slicing from the first ``[`` to the last ``]`` if a direct parse fails.
    """
    try:
        parsed = json.loads(text)
    except json.JSONDecodeError:
        start = text.find("[")
        end = text.rfind("]")
        if start == -1 or end == -1 or end < start:
            raise ValueError("Model response did not contain a JSON array.")
        parsed = json.loads(text[start : end + 1])

    if not isinstance(parsed, list):
        raise ValueError("Model response was not a JSON array.")
    return parsed


def chat_suggest_recipes(message: str) -> list[dict]:
    """Suggest recipes from a freeform natural language message.

    Uses Claude with tool use to search the recipe database first, then
    generates or filters recipes based on the user's request and preferences.
    """
    from services.supabase import find_recipes_by_ingredients, supabase_configured

    client = get_anthropic_client()

    search_tool = {
        "name": "search_recipe_database",
        "description": (
            "Search the saved recipe database for recipes that match the given "
            "ingredients. Always call this before generating new recipes."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "ingredients": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Ingredient names extracted from the user's request.",
                },
            },
            "required": ["ingredients"],
        },
    }

    recipe_shape = (
        "{\n"
        '  "title": string,\n'
        '  "ingredients": [{"name": string, "amount": string, "unit": string}],\n'
        '  "steps": [string],\n'
        '  "time_minutes": integer,\n'
        '  "meal_type": string,\n'
        '  "flavor_tags": [string],\n'
        '  "source": "suggested"\n'
        "}"
    )

    system = (
        "You are a helpful chef assistant. When the user describes ingredients "
        "they have or what they want to eat, search the recipe database for matches. "
        "Then respond with ONLY a JSON array (no prose, no markdown) of 3 to 5 "
        f"recipe suggestions. Each item must use this exact shape:\n{recipe_shape}\n"
        "Recipes returned from the database may keep their original 'id' field. "
        "Newly generated recipes must omit the 'id' field."
    )

    use_tools = supabase_configured()
    messages: list[dict] = [{"role": "user", "content": message}]

    for _ in range(5):  # Safety cap on the agentic loop
        response = client.messages.create(
            model=settings.ANTHROPIC_MODEL,
            max_tokens=4096,
            system=system,
            tools=[search_tool] if use_tools else [],
            messages=messages,
        )

        if response.stop_reason == "tool_use":
            tool_results = []
            for block in response.content:
                if block.type == "tool_use" and block.name == "search_recipe_database":
                    ingredients: list[str] = block.input.get("ingredients", [])
                    try:
                        db_results = find_recipes_by_ingredients(ingredients, limit=10)
                    except Exception:
                        db_results = []
                    tool_results.append(
                        {
                            "type": "tool_result",
                            "tool_use_id": block.id,
                            "content": json.dumps(db_results),
                        }
                    )
            messages.append({"role": "assistant", "content": response.content})
            messages.append({"role": "user", "content": tool_results})

        elif response.stop_reason == "end_turn":
            text = "".join(
                block.text for block in response.content if block.type == "text"
            )
            return _extract_json_array(text)

        else:
            break

    raise ValueError("Claude did not return a recipe list.")


def generate_recipe_suggestions(ingredients: list[str]) -> list[dict]:
    """Generate 3-5 recipes from a confirmed ingredient list.

    Returns a list of raw recipe dicts matching the shared Recipe shape; the
    caller is responsible for validating them against the ``Recipe`` model.
    """
    client = get_anthropic_client()
    ingredient_text = ", ".join(ingredients)

    prompt = (
        "You are a helpful chef. Suggest 3 to 5 recipes that can be made "
        f"primarily from these ingredients: {ingredient_text}.\n\n"
        "Respond with ONLY a JSON array (no prose, no markdown) where each "
        "item has this exact shape:\n"
        "{\n"
        '  "title": string,\n'
        '  "ingredients": [{"name": string, "amount": string, "unit": string}],\n'
        '  "steps": [string],\n'
        '  "time_minutes": integer,\n'
        '  "meal_type": string,\n'
        '  "flavor_tags": [string],\n'
        '  "source": "suggested"\n'
        "}"
    )

    message = client.messages.create(
        model=settings.ANTHROPIC_MODEL,
        max_tokens=2048,
        messages=[{"role": "user", "content": prompt}],
    )

    text = "".join(
        block.text for block in message.content if block.type == "text"
    )
    return _extract_json_array(text)

