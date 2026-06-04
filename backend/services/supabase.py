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
