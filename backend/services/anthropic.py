from functools import lru_cache

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
