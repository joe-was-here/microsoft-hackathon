import json
import re

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from config import settings
from services.anthropic import get_anthropic_client

router = APIRouter(prefix="/pantry", tags=["pantry"])

DETECT_PROMPT = (
    "You are a kitchen assistant. Look at this image and identify all visible "
    "food ingredients or pantry items. Return ONLY a valid JSON object with no "
    "markdown fences, in this exact shape:\n"
    '{"ingredients": [{"name": "<ingredient>", "confidence": "<high|medium|low>"}]}\n'
    "Use 'high' when the item is clearly visible and identifiable, 'medium' when "
    "reasonably sure, and 'low' when uncertain. Include every visible ingredient."
)


class DetectRequest(BaseModel):
    image: str  # base64-encoded image data
    media_type: str = "image/jpeg"  # e.g. image/jpeg, image/png, image/webp


class Ingredient(BaseModel):
    name: str
    confidence: str


class DetectResponse(BaseModel):
    ingredients: list[Ingredient]


@router.post("/detect", response_model=DetectResponse)
async def detect_ingredients(body: DetectRequest) -> DetectResponse:
    client = get_anthropic_client()

    message = client.messages.create(
        model=settings.ANTHROPIC_MODEL,
        max_tokens=1024,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": body.media_type,
                            "data": body.image,
                        },
                    },
                    {
                        "type": "text",
                        "text": DETECT_PROMPT,
                    },
                ],
            }
        ],
    )

    raw = message.content[0].text.strip()

    # Strip any accidental markdown code fences Claude may add
    raw = re.sub(r"^```[a-z]*\n?", "", raw)
    raw = re.sub(r"\n?```$", "", raw)

    try:
        data = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Claude returned non-JSON response: {raw[:200]}",
        ) from exc

    return DetectResponse(ingredients=data.get("ingredients", []))
