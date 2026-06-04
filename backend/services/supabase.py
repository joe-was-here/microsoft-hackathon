from functools import lru_cache

from supabase import Client, create_client

from config import settings


@lru_cache
def get_supabase_client() -> Client:
    """Return a cached Supabase client.

    Requires SUPABASE_URL and SUPABASE_KEY to be set in the environment.
    """
    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        raise RuntimeError(
            "Supabase credentials are missing. Set SUPABASE_URL and SUPABASE_KEY."
        )
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
