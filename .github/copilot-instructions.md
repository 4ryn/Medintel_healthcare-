# Copilot Instructions for MedIntel Healthcare

## Project Overview
MedIntel Healthcare is a modular, AI-powered healthcare management system. It integrates OCR, LLMs, vector search, and predictive analytics for patient-clinician workflows. The codebase is split into a Next.js frontend and a FastAPI backend, with PostgreSQL, Qdrant, and Redis as core infrastructure.

## Architecture & Data Flow
- **Frontend (`frontend/`)**: Next.js 14, React 18, Tailwind CSS. App pages in `src/app/`, components in `src/components/`. Auth via NextAuth.js. API calls to backend.
- **Backend (`backend/`)**: FastAPI app in `app/`. Key subfolders:
  - `models/`: SQLAlchemy DB models
  - `routes/`: API endpoints (REST)
  - `services/`: Business logic (OCR, LLM, vector, notifications)
  - `config.py`: Settings from `.env`
- **Data Flow**: Document/image → OCR (PaddleOCR/Tesseract) → text chunking → embedding (Sentence Transformers) → Qdrant vector DB. Retrieval uses similarity search, optional LLM synthesis.
- **Async Tasks**: Celery + Redis for background jobs (OCR, notifications, ML risk models).

## Developer Workflows
- **Setup**: See `README.md` for full instructions. Key steps:
  - Install Python, Node, PostgreSQL, Qdrant, Redis
  - Configure `.env` (see `.env.example`)
  - `pip install -r requirements.txt` (backend), `npm install` (frontend)
  - DB migrations: `alembic upgrade head`
- **Run**: Use `npm run dev` (all services) or start backend/frontend/Celery separately (see README)
- **Testing**:
  - Backend: `pytest tests/`
  - Frontend: `npm test` or `npm run test:e2e`
  - Use provided curl/python scripts for API/feature checks
- **Logs**: Backend logs to `app.log`, Celery logs via `--loglevel=debug`

## Project-Specific Patterns
- **Modularity**: Each service (OCR, LLM, vector, notifications) is a swappable module. Add new models/services by extending `services/` and updating DI in `main.py`.
- **Provenance**: All ingested data is chunked with metadata for traceability. Retrieval APIs return provenance info.
- **Security**: JWT auth, HTTPS, encrypted storage, rate limits. Auth flows in `routes/auth.py` and NextAuth.js config.
- **Testing**: Use real sample data for end-to-end validation. KPIs: OCR accuracy, retrieval precision@k, ingestion latency.
- **Background Tasks**: Use Celery for async jobs (OCR, notifications, ML). See `app/celery.py` and `services/`.

## Integration Points
- **Frontend-backend**: REST API calls from Next.js to FastAPI endpoints
- **Vector DB**: Qdrant used for semantic search; see `services/vector_service.py`
- **LLM**: OpenRouter API for LLM calls; see `services/llm_service.py`
- **Notifications**: Firebase Cloud Messaging for push notifications
- **Video**: Jitsi Meet integration for video calls

## Examples
- Add a new API: create route in `backend/app/routes/`, register in `main.py`, add service logic in `services/`
- Add a new frontend page: create file in `frontend/src/app/`, add components in `frontend/src/components/`
- Add a new background task: define Celery task in `backend/app/services/`, call from API route

## References
- See `README.md` for setup, testing, and troubleshooting
- Key files: `backend/app/main.py`, `backend/app/services/`, `frontend/src/app/`, `.env.example`

---
For any unclear patterns or missing conventions, check `README.md` or ask the core team.
