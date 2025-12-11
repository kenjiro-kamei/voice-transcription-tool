# Backend - Voice Transcription Tool

## Setup Instructions

### 1. Install Python Dependencies

```bash
cd backend

# Create virtual environment (Python 3.11+ recommended)
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Linux/Mac
# or
venv\Scripts\activate  # On Windows

# Install dependencies
pip install -r requirements.txt
```

### 2. Environment Variables

Ensure `.env.local` exists in the project root with the following variables:

```
DATABASE_URL=postgresql://user:password@host:port/dbname
OPENAI_API_KEY=sk-...
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...
REDIS_URL=redis://...
FRONTEND_URL=http://localhost:3427
BACKEND_URL=http://localhost:8567
CORS_ORIGIN=http://localhost:3427
```

### 3. Database Migration

```bash
# Run migrations to create database tables
alembic upgrade head
```

### 4. Run the Server

```bash
# Development server with hot reload
uvicorn src.main:app --reload --host 0.0.0.0 --port 8567
```

### 5. Run Celery Worker (for async tasks)

```bash
# In a separate terminal
celery -A src.celery_app worker --loglevel=info
```

## API Endpoints

- `GET /` - Root endpoint with API info
- `GET /api/health` - Health check endpoint

## Testing

```bash
# Run integration tests
pytest backend/tests/integration/
```

## Architecture

```
backend/
├── src/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── config.py            # Environment configuration
│   ├── database.py          # SQLAlchemy setup
│   ├── celery_app.py        # Celery configuration
│   ├── models/              # SQLAlchemy models
│   │   └── __init__.py
│   ├── schemas/             # Pydantic schemas
│   │   └── __init__.py
│   ├── routers/             # API routers
│   │   ├── __init__.py
│   │   └── health.py
│   └── services/            # Business logic
│       ├── __init__.py
│       └── r2_service.py
├── tests/
│   └── integration/
├── alembic/                 # Database migrations
├── alembic.ini
└── requirements.txt
```

## Troubleshooting

### SQLAlchemy Connection Error

If you encounter SQLAlchemy connection errors, run:

```bash
alembic upgrade head
```

### Database URL Error

Ensure `DATABASE_URL` in `.env.local` is correctly formatted:

```
postgresql://user:password@host:port/dbname?sslmode=require
```
