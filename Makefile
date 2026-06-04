# AI Sous Chef — local development helpers
#
# Usage:
#   make install   # install backend + frontend dependencies
#   make dev       # run backend and frontend together
#   make backend   # run only the FastAPI backend (http://localhost:8000)
#   make frontend  # run only the Vite frontend (http://localhost:5173)

# Use the repo-local virtualenv if present, otherwise fall back to system python.
VENV := .venv
PYTHON := $(if $(wildcard $(VENV)/bin/python),$(VENV)/bin/python,python3)

.DEFAULT_GOAL := help

.PHONY: help install install-backend install-frontend dev backend frontend

help:
	@echo "Available commands:"
	@echo "  make install   Install backend + frontend dependencies"
	@echo "  make dev       Run backend and frontend together"
	@echo "  make backend   Run only the FastAPI backend (http://localhost:8000)"
	@echo "  make frontend  Run only the Vite frontend (http://localhost:5173)"

install: install-backend install-frontend

install-backend:
	$(PYTHON) -m pip install -r backend/requirements.txt

install-frontend:
	cd ui && pnpm install

backend:
	cd backend && $(abspath $(PYTHON)) -m uvicorn main:app --reload

frontend:
	cd ui && pnpm dev

# Run both servers together. Backend runs in the background; when the frontend
# stops (Ctrl+C), the backend is shut down too.
dev:
	@echo "Starting backend (http://localhost:8000) and frontend (http://localhost:5173)..."
	@trap 'kill 0' EXIT INT TERM; \
		( cd backend && $(abspath $(PYTHON)) -m uvicorn main:app --reload ) & \
		( cd ui && pnpm dev ) & \
		wait
