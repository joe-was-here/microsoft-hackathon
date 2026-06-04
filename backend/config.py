import os

from dotenv import load_dotenv

# Load environment variables from a local .env file if present (no-op in
# production where variables are provided by the platform, e.g. Railway).
load_dotenv()


class Settings:
    """Application configuration loaded from environment variables."""

    SUPABASE_URL: str = os.environ.get("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.environ.get("SUPABASE_KEY", "")
    ANTHROPIC_API_KEY: str = os.environ.get("ANTHROPIC_API_KEY", "")
    ANTHROPIC_MODEL: str = os.environ.get("ANTHROPIC_MODEL", "claude-3-5-haiku-20241022")

    # Comma-separated list of allowed frontend origins for CORS.
    FRONTEND_URL: str = os.environ.get("FRONTEND_URL", "")


settings = Settings()
