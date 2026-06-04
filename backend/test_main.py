from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "hello world"}


def test_suggest_requires_ingredients():
    response = client.post("/recipes/suggest", json={"ingredients": []})
    assert response.status_code == 400


def test_suggest_returns_recipes(monkeypatch):
    fake_recipes = [
        {
            "title": "Cheese Omelette",
            "ingredients": [{"name": "eggs", "amount": "3", "unit": "whole"}],
            "steps": ["Beat the eggs", "Cook in a pan", "Add cheese"],
            "time_minutes": 10,
            "meal_type": "breakfast",
            "flavor_tags": ["savory"],
            "source": "suggested",
        }
    ]

    monkeypatch.setattr(
        "routers.recipes.generate_recipe_suggestions",
        lambda ingredients: fake_recipes,
    )

    response = client.post(
        "/recipes/suggest", json={"ingredients": ["eggs", "cheddar cheese"]}
    )

    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    assert body[0]["title"] == "Cheese Omelette"
    assert body[0]["source"] == "suggested"
    assert body[0]["ingredients"][0]["name"] == "eggs"

