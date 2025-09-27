# MedIntel Healthcare - AI-Powered Healthcare Management System

## 🚀 Project Overview

MedIntel Healthcare is a comprehensive healthcare management system that leverages AI for intelligent document processing, predictive analytics, and seamless patient-clinician collaboration.

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14, React 18, Tailwind CSS, shadcn/ui
- **Backend**: FastAPI, Python 3.11+
- **Database**: PostgreSQL (Neon), Qdrant (Vector DB)
- **AI/ML**: OpenRouter API, Sentence Transformers, scikit-learn, XGBoost
- **OCR**: PaddleOCR, Tesseract
- **Real-time**: Celery, Redis, APScheduler
- **Authentication**: NextAuth.js, JWT
- **Notifications**: Firebase Cloud Messaging
- **Video Calls**: Jitsi Meet

### Project Structure
```
medintel-healthcare/
├── frontend/                 # Next.js React application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # React components
│   │   └── lib/            # Utilities and configurations
├── backend/                 # FastAPI Python application
│   ├── app/
│   │   ├── models/         # Database models
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   └── config.py       # Configuration
├── shared/                  # Shared types and utilities
└── .env                    # Environment variables
```

## 📋 Features

### Patient Application
- ✅ Health Data Entry (Vitals Form)
- ✅ Upload Reports/Prescriptions  
- ✅ Personal Dashboard
- ✅ Care Plan Tracking
- ✅ Notifications
- ✅ AI Nurse Chatbot
- ✅ Document Upload with OCR

### Clinic Dashboard
- ✅ Patient List Management
- ✅ Alerts & Notifications
- ✅ Patient Timeline
- ✅ Care Plan Management
- ✅ Predictive Risk Analysis
- ✅ Doctor-Patient Interaction (Video)

### AI Features
- ✅ Document OCR with PaddleOCR/Tesseract
- ✅ LLM-based data extraction (Mistral 7B)
- ✅ Vector search with Qdrant
- ✅ Risk prediction models (5 chronic diseases)
- ✅ AI-generated patient summaries
- ✅ Personalized notifications

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ and npm/pnpm
- Python 3.11+
- PostgreSQL database (or Neon account)
- Qdrant instance (cloud or self-hosted)
- Redis server
- Git

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd medintel-healthcare

# Install backend dependencies
cd backend
#for windows(create virtual environment)
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Install frontend dependencies  
cd ../frontend
npm install

# Return to root and install global dependencies
cd ..
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `QDRANT_URL` & `QDRANT_API_KEY`: Vector database
- `OPENROUTER_API_KEY`: For LLM services
- `JWT_SECRET_KEY`: For authentication
- `REDIS_URL`: For background tasks

### 3. Database Setup

```bash
# Run database migrations
cd backend
alembic upgrade head

# Seed sample data (optional)
python scripts/setup_database.py
```

### 4. Start Services

```bash
# Terminal 1 - Backend API
cd backend
.venv\Scripts\Activate.ps1
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 - Frontend
cd frontend  
npm run dev

```

## 🧪 Testing Commands

### Test Application Setup

#### 1. Test Backend API
```bash
# Test API health
curl http://localhost:8000/health

# Test authentication
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123",
    "full_name": "Test User",
    "role": "patient"
  }'
```

#### 2. Test Frontend
```bash
# Access the application
open http://localhost:3000

# Test registration page
open http://localhost:3000/auth/register

# Test login functionality
open http://localhost:3000/auth/login
```

#### 3. Test Database Connection
```bash
cd backend
python -c "
from app.database import engine
import asyncio

async def test_db():
    async with engine.begin() as conn:
        result = await conn.execute('SELECT 1')
        print('✅ Database connected successfully')

asyncio.run(test_db())
"
```

#### 4. Test Qdrant Vector Database
```bash
cd backend
python -c "
from app.services.vector_service import VectorService
import asyncio

async def test_qdrant():
    vs = VectorService()
    await vs.initialize_collection()
    print('✅ Qdrant connected and collection initialized')

asyncio.run(test_qdrant())
"
```

#### 5. Test OCR Service
```bash
cd backend
python -c "
from app.services.ocr_service import OCRService

ocr = OCRService()
print('✅ OCR Service initialized')
print(f'PaddleOCR available: {ocr.paddle_available}')
print(f'Tesseract available: {ocr.tesseract_available}')
"
```

#### 6. Test LLM Service
```bash
cd backend
python -c "
from app.services.llm_service import LLMService

llm = LLMService()
result = llm.extract_medical_data('Blood Pressure: 120/80 mmHg, Heart Rate: 72 bpm')
print('✅ LLM Service working')
print(f'Extraction successful: {result[\"success\"]}')
"
```

### Testing Specific Features

#### Patient Dashboard Test
```bash
# 1. Register as patient
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@test.com",
    "password": "testpass123", 
    "full_name": "Test Patient",
    "role": "patient"
  }'

# 2. Login and get token
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=patient@test.com&password=testpass123" | jq -r .access_token)

# 3. Test vitals recording
curl -X POST http://localhost:8000/api/v1/patients/vitals \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "blood_pressure_systolic": 120,
    "blood_pressure_diastolic": 80,
    "heart_rate": 72,
    "weight": 70.5
  }'

# 4. Test dashboard
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/patients/dashboard
```

#### Document Upload Test
```bash
# Test document upload (with test file)
curl -X POST http://localhost:8000/api/v1/documents/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test_document.pdf" \
  -F "report_type=lab_report"
```

#### Clinic Dashboard Test
```bash
# 1. Register as clinic
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "clinic@test.com",
    "password": "testpass123",
    "full_name": "Test Clinic", 
    "role": "clinician"
  }'

# 2. Login and test patient list
CLINIC_TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=clinic@test.com&password=testpass123" | jq -r .access_token)

curl -H "Authorization: Bearer $CLINIC_TOKEN" \
  http://localhost:8000/api/v1/clinic/patients
```

### Running Test Suites

#### Backend Tests
```bash
cd backend
pytest tests/ -v
```

#### Frontend Tests  
```bash
cd frontend
npm test
```

#### Integration Tests
```bash
# Run end-to-end tests
cd frontend
npm run test:e2e
```

### Performance Testing

#### Load Test API
```bash
# Install hey (HTTP load testing tool)
# Test API performance
hey -n 100 -c 10 http://localhost:8000/health
```

#### Test OCR Performance
```bash
cd backend
python scripts/test_ocr_performance.py
```

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
# Build frontend
cd frontend
npm run build

# Test production build
npm start
```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 📝 API Documentation

Access interactive API docs at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🔧 Development Workflow

### 1. Feature Development
1. Create feature branch: `git checkout -b feature/new-feature`
2. Implement backend API endpoints
3. Add frontend components
4. Write tests
5. Test manually with curl/browser
6. Submit PR

### 2. Testing Checklist
- [ ] Backend API endpoints respond correctly
- [ ] Frontend components render and function
- [ ] Database operations work
- [ ] Authentication flows work
- [ ] File uploads process correctly
- [ ] OCR extraction works
- [ ] LLM data extraction works
- [ ] Vector search functions
- [ ] Notifications send successfully

### 3. Common Issues & Solutions

#### Database Connection Issues
```bash
# Check database URL format
echo $DATABASE_URL

# Test connection manually
cd backend
python -c "from app.database import engine; print('DB OK')"
```

#### OCR Issues
```bash
# Install system dependencies
# Ubuntu/Debian:
sudo apt-get install tesseract-ocr

# macOS:
brew install tesseract

# Windows: Download from GitHub releases
```

#### Missing Dependencies
```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend  
cd frontend
npm install
```

## 📊 Monitoring & Logs

### View Application Logs
```bash
# Backend logs
cd backend
tail -f app.log

# Frontend development logs
cd frontend
npm run dev

# Celery worker logs
cd backend
celery -A app.celery worker --loglevel=debug
```

### Health Checks
- Backend: http://localhost:8000/health
- Frontend: http://localhost:3000
- Database: Check connection in backend logs
- Redis: `redis-cli ping`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Ensure all tests pass
6. Submit pull request

## 📞 Support

For issues and questions:
- Check the documentation
- Run diagnostic commands above
- Create GitHub issue with logs
- Contact development team

---

**Ready to revolutionize healthcare with AI! 🚀💊🤖**
