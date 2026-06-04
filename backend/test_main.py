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

def test_list_recipes_success(monkeypatch):
    class MockQuery:
        def select(self, _):
            return self

        def order(self, *_args, **_kwargs):
            return self

        def limit(self, _):
            return self

        def execute(self):
            class Response:
                data = [{"title": "Test Recipe"}]

            return Response()

    class MockClient:
        def table(self, table_name):
            assert table_name == "recipes"
            return MockQuery()

    monkeypatch.setattr("routers.recipes.get_supabase_client", lambda: MockClient())

    response = client.get("/recipes/?limit=5")
    assert response.status_code == 200
    assert response.json() == [{"title": "Test Recipe"}]


def test_list_recipes_failure(monkeypatch):
    def raise_error():
        raise RuntimeError("boom")

    monkeypatch.setattr("routers.recipes.get_supabase_client", raise_error)

    response = client.get("/recipes/")
    assert response.status_code == 500
    assert response.json() == {"detail": "Failed to fetch recipes"}
