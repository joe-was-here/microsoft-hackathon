from fastapi import APIRouter

router = APIRouter(prefix="/recipes", tags=["recipes"])


@router.get("/")
async def list_recipes() -> list[dict]:
    # Placeholder: will query Supabase and/or generate via Anthropic.
    return []
