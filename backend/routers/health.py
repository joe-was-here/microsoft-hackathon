from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/")
async def health_check() -> dict[str, str]:
    return {"message": "hello world"}
