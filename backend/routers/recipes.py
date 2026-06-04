import logging

from fastapi import APIRouter, HTTPException, Query

from services.supabase import get_supabase_client


logger = logging.getLogger(__name__)

router = APIRouter(prefix="/recipes", tags=["recipes"])


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
