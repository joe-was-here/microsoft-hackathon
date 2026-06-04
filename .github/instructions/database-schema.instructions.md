---
applyTo: "backend/**/*.py,**/*.sql"
---

# Database Schema

## Supabase — `recipes` table

```sql
create table recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  ingredients jsonb not null,
  steps jsonb not null,
  meal_type text,
  flavor_tags text[],
  time_minutes int,
  source text, -- 'suggested' | 'manual' | 'ocr' | 'randomizer'
  created_at timestamptz default now()
);
```

## Column reference

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key, auto-generated |
| `title` | `text` | Required |
| `ingredients` | `jsonb` | Required; store as structured JSON |
| `steps` | `jsonb` | Required; store as structured JSON (ordered array) |
| `meal_type` | `text` | Optional; e.g. `breakfast`, `lunch`, `dinner`, `snack` |
| `flavor_tags` | `text[]` | Optional; Postgres text array of flavor descriptors |
| `time_minutes` | `int` | Optional; total cook/prep time in minutes |
| `source` | `text` | How the recipe was created — one of `suggested`, `manual`, `ocr`, `randomizer` |
| `created_at` | `timestamptz` | Auto-set to current timestamp |

## Rules for agents

- Always use the `id` (uuid) as the primary reference when fetching, updating, or deleting a recipe.
- `ingredients` and `steps` are `jsonb` — serialize/deserialize as Python `dict`/`list`; do not store plain strings.
- `source` must be one of the four allowed values: `suggested`, `manual`, `ocr`, `randomizer`.
- `flavor_tags` is a Postgres native array (`text[]`); pass as a Python `list[str]` when using the Supabase client.
- Do not manually set `id` or `created_at`; let the database generate them.
- When inserting a new recipe, `title`, `ingredients`, and `steps` are the only required fields.
