# AI Sous Chef

AI-powered recipe app. React frontend + FastAPI backend, with Supabase and the Anthropic API.

## Structure

```
ui/        React + Vite frontend  → Vercel
backend/   FastAPI API            → Railway
```

## Local development

Backend:

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload   # http://localhost:8000
```

Frontend:

```bash
cd ui
pnpm install
cp .env.example .env.local  # set VITE_API_URL
pnpm dev                     # http://localhost:5173
```

## Environment variables

Backend (set in Railway): `ANTHROPIC_API_KEY`, `SUPABASE_URL`, `SUPABASE_KEY`, `FRONTEND_URL`

Frontend (set in Vercel): `VITE_API_URL` — the Railway backend URL

## Deployment

- **Backend → Railway:** root directory `backend`, start command from `Procfile` / `railway.toml`.
- **Frontend → Vercel:** root directory `ui`.
