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

