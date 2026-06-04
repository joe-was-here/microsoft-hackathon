"""Shared domain models.

The ``Recipe`` shape is the single source of truth on the backend and mirrors
the frontend TypeScript ``Recipe`` type. Every entry point (suggested, manual,
OCR, randomizer) reads and writes this same structure.
"""

from typing import Literal

from pydantic import BaseModel, Field

RecipeSource = Literal["suggested", "manual", "ocr", "randomizer"]


class RecipeIngredient(BaseModel):
    name: str
    amount: str = ""
    unit: str = ""


class Recipe(BaseModel):
    id: str | None = None
    title: str
    ingredients: list[RecipeIngredient] = Field(default_factory=list)
    steps: list[str] = Field(default_factory=list)
    meal_type: str | None = None
    flavor_tags: list[str] = Field(default_factory=list)
    time_minutes: int | None = None
    source: RecipeSource = "suggested"
