# Setup Troubleshooting Guide

## Overview
This document tracks common setup issues and their solutions for the MedIntel Healthcare backend.

## Fixed Dependency Issues (Feb 2, 2026)

### Missing Python Packages
The virtual environment was missing several critical packages that were listed in `requirements.txt` but not installed. Below are the packages that needed to be installed:

#### 1. Email Validator
**Error:**
```
ImportError: email-validator is not installed, run `pip install 'pydantic[email]'`
```

**Solution:**
```bash
pip install 'pydantic[email]'
# or
pip install email-validator==2.3.0
```

**Why needed:** Pydantic uses `email-validator` for `EmailStr` field validation in models (e.g., `UserCreate` in `app/routes/auth.py`).

#### 2. OpenAI
**Error:**
```
ModuleNotFoundError: No module named 'openai'
```

**Solution:**
```bash
pip install openai==1.3.6
```

**Why needed:** Required by `app/services/llm_service.py` for LLM integrations.

#### 3. Greenlet
**Error:**
```
ValueError: the greenlet library is required to use this function. No module named 'greenlet'
```

**Solution:**
```bash
pip install greenlet==3.3.1
```

**Why needed:** SQLAlchemy's async engine (`create_async_engine`) requires greenlet for coroutine-based database operations.

#### 4. OpenCV (cv2)
**Error:**
```
ModuleNotFoundError: No module named 'cv2'
```

**Solution:**
```bash
pip install opencv-python==4.9.0.80
```

**Why needed:** Used in `app/services/llm_service.py` for image processing operations.

#### 5. Qdrant Client
**Error:**
```
ModuleNotFoundError: No module named 'qdrant_client'
```

**Solution:**
```bash
pip install qdrant-client==1.6.9
```

**Why needed:** Required by `app/services/vector_service.py` for vector database operations.

#### 6. Sentence Transformers
**Error:**
```
ModuleNotFoundError: No module named 'sentence_transformers'
```

**Solution:**
```bash
pip install sentence-transformers==2.7.0
```

**Why needed:** Used in `app/services/vector_service.py` for generating embeddings for semantic search.

## Updated Package Versions

The following packages had version mismatches and were updated in `requirements.txt`:

- `pydantic`: 2.5.0 → 2.12.5
- `email-validator`: 2.1.0 → 2.3.0
- `scikit-learn`: 1.4.0 → 1.8.0
- `huggingface-hub`: 0.23.4 → 0.36.0
- `transformers`: >=4.35.0 → 4.57.6
- **NEW:** `greenlet`: 3.3.1 (added to requirements)

## Proper Setup Process

To avoid these issues in the future, follow these steps:

### 1. Create and Activate Virtual Environment
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On macOS/Linux
# or
.\venv\Scripts\activate  # On Windows
```

### 2. Install All Dependencies
```bash
pip install -r requirements.txt
```

**Important:** Always run this command after creating a new virtual environment or pulling updates that modify `requirements.txt`.

### 3. Verify Installation
```bash
# Check for missing dependencies
pip check

# Test imports
python -c "from main import app; print('✅ App loaded successfully!')"
```

### 4. Start the Server
```bash
uvicorn main:app --reload
```

## Common Issues

### Issue: "Address already in use"
**Error:**
```
ERROR: [Errno 48] Address already in use
```

**Solution:**
1. Stop the existing uvicorn process (Ctrl+C)
2. Or kill the process using the port:
   ```bash
   # Find the process
   lsof -i :8000
   # Kill it
   kill -9 <PID>
   ```

### Issue: "externally-managed-environment"
**Error:**
```
error: externally-managed-environment
```

**Solution:**
Always use a virtual environment. Do NOT install packages system-wide on macOS with Homebrew Python:
```bash
# Create venv if it doesn't exist
python3 -m venv venv

# Activate it
source venv/bin/activate

# Install packages
pip install <package-name>
```

### Issue: Package version conflicts
**Solution:**
1. Clear the virtual environment:
   ```bash
   rm -rf venv
   python3 -m venv venv
   source venv/bin/activate
   ```

2. Reinstall all packages:
   ```bash
   pip install -r requirements.txt
   ```

## Database Setup Issues

### PostgreSQL Connection Errors
Ensure PostgreSQL is running and the `.env` file has correct credentials:
```bash
# Start PostgreSQL (macOS with Homebrew)
brew services start postgresql@14

# Check if running
psql postgres -c "SELECT version();"
```

### Missing Database Tables
Run Alembic migrations:
```bash
alembic upgrade head
```

## Environment Variables

Ensure `.env` file exists in the `backend/` directory with all required variables. See `.env.example` for reference.

Required variables:
- `DATABASE_URL`
- `QDRANT_HOST`
- `QDRANT_PORT`
- `REDIS_URL`
- `OPENROUTER_API_KEY`
- `FIREBASE_CREDENTIALS_PATH`
- And others...

## Testing the Setup

After installation, run these verification tests:

```bash
# 1. Check Python version (should be 3.12+)
python --version

# 2. Verify all imports work
python -c "from app.routes import auth, patients, clinic, documents, notifications, analytics, vitals, appointments, care_plans, ai_insights, support; print('✅ All imports successful!')"

# 3. Check database connection
python -c "from app.database import engine; print('✅ Database connection configured!')"

# 4. Verify vector service
python -c "from app.services.vector_service import VectorService; print('✅ Vector service ready!')"

# 5. Load the FastAPI app
python -c "from main import app; print('✅ FastAPI app loaded!')"
```

## Additional Notes

- **Always activate the virtual environment** before running any Python commands
- Keep `requirements.txt` updated when adding new dependencies
- Test the installation after major updates
- Document any new dependency issues in this file

## Need Help?

If you encounter issues not covered here:
1. Check the error message carefully
2. Verify all dependencies are installed: `pip list`
3. Check the application logs: `backend/app.log`
4. Review the README.md for general setup instructions