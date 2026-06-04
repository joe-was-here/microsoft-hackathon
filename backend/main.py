from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from routers import health, pantry, recipes


def create_app() -> FastAPI:
    app = FastAPI(
        title="AI Sous Chef API",
        description="Backend service for the AI-powered recipe app.",
        version="0.1.0",
    )

    allowed_origins = [
        "http://localhost:3000",
        "http://localhost:5173",
    ]
    # Add production frontend origins from the FRONTEND_URL env var
    # (comma-separated to support multiple Vercel domains/previews).
    allowed_origins += [
        origin.strip()
        for origin in settings.FRONTEND_URL.split(",")
        if origin.strip()
    ]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health.router)
    app.include_router(pantry.router)
    app.include_router(recipes.router)

    return app


app = create_app()