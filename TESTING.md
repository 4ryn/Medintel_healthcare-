# 🧪 MedIntel Healthcare - Complete Testing Guide

## Quick Start Testing Commands

### Step 1: Install Dependencies and Setup
```bash
# Navigate to project root
cd medintel-healthcare

# Install backend dependencies
cd backend
pip install -r requirements.txt

# Install frontend dependencies
cd ../frontend
npm install

# Return to root
cd ..
```

### Step 2: Configure Environment
```bash
# Copy environment file
cp .env.example .env

# Edit .env with your actual values
# Your current .env is already configured with:
# - Azure Cognitive Services
# - Neon PostgreSQL Database  
# - Qdrant Vector Database
# - OpenRouter API Key
```

### Step 3: Test Individual Components

#### A. Test Backend API Setup
```bash
cd backend

# Test 1: Check Python imports
python -c "
try:
    from app.config import settings
    print('✅ Configuration loaded successfully')
    print(f'Database URL configured: {bool(settings.DATABASE_URL)}')
    print(f'Qdrant configured: {bool(settings.QDRANT_URL)}')
    print(f'OpenRouter API configured: {bool(settings.OPENROUTER_API_KEY)}')
except Exception as e:
    print(f'❌ Configuration error: {e}')
"

# Test 2: Database connection
python -c "
import asyncio
from app.database import engine

async def test_db():
    try:
        async with engine.begin() as conn:
            result = await conn.execute('SELECT 1 as test')
            row = result.fetchone()
            print(f'✅ Database connected successfully: {row[0]}')
    except Exception as e:
        print(f'❌ Database connection failed: {e}')

asyncio.run(test_db())
"
```

**Expected Output:**
```
✅ Configuration loaded successfully
Database URL configured: True
Qdrant configured: True
OpenRouter API configured: True
✅ Database connected successfully: 1
```

#### B. Test Qdrant Vector Database
```bash
# Test 3: Qdrant connection
python -c "
import asyncio
from app.services.vector_service import VectorService

async def test_qdrant():
    try:
        vs = VectorService()
        await vs.initialize_collection()
        print('✅ Qdrant vector database connected and collection initialized')
    except Exception as e:
        print(f'❌ Qdrant connection failed: {e}')

asyncio.run(test_qdrant())
"
```

**Expected Output:**
```
✅ Created Qdrant collection: medintel
✅ Qdrant vector database connected and collection initialized
```

#### C. Setup Database Tables and Sample Data
```bash
# Test 4: Create tables and seed data
python scripts/setup_database.py
```

**Expected Output:**
```
🚀 Setting up MedIntel Healthcare database...
🔧 Creating database tables...
✅ Database tables created successfully
🔧 Initializing vector store...
✅ Vector store initialized successfully
🌱 Seeding sample data...
✅ Created 4 users
✅ Created 2 patients
✅ Created 60 vitals records
✅ Created 2 care plans
✅ Created 10 risk scores
✅ Created 6 notifications

🎉 Database setup completed successfully!

📋 Sample accounts created:
   Patient 1: patient1@demo.com / password123
   Patient 2: patient2@demo.com / password123
   Doctor: doctor@demo.com / password123
   Clinic Admin: clinic@demo.com / password123
```

#### D. Test OCR Service
```bash
# Test 5: OCR functionality
python -c "
from app.services.ocr_service import OCRService

ocr = OCRService()
print('🔧 OCR Service Status:')
print(f'✅ PaddleOCR available: {ocr.paddle_available}')
print(f'✅ Tesseract available: {ocr.tesseract_available}')

if ocr.paddle_available or ocr.tesseract_available:
    print('✅ OCR service ready for document processing')
else:
    print('⚠️ No OCR engine available - install PaddleOCR or Tesseract')
"
```

#### E. Test LLM Service
```bash
# Test 6: LLM data extraction
python -c "
import asyncio
from app.services.llm_service import LLMService

async def test_llm():
    try:
        llm = LLMService()
        sample_text = '''
        Patient: John Doe
        Date: 2024-01-15
        Blood Pressure: 140/90 mmHg
        Heart Rate: 75 bpm
        Weight: 80 kg
        Glucose (fasting): 126 mg/dL
        '''
        
        result = llm.extract_medical_data(sample_text)
        if result['success']:
            print('✅ LLM extraction successful')
            data = result['extracted_data']
            print(f'   - Blood Pressure: {data.get(\"blood_pressure_systolic\")}/{data.get(\"blood_pressure_diastolic\")}')
            print(f'   - Heart Rate: {data.get(\"heart_rate\")}')
            print(f'   - Glucose: {data.get(\"glucose_fasting\")}')
        else:
            print(f'❌ LLM extraction failed: {result.get(\"error\")}')
    except Exception as e:
        print(f'❌ LLM service error: {e}')

asyncio.run(test_llm())
"
```

### Step 4: Start and Test API Server

#### A. Start the Backend Server
```bash
# Terminal 1: Start API server
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Expected Output:**
```
🚀 Starting MedIntel Healthcare API...
✅ Database and vector store initialized
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

#### B. Test API Endpoints (New Terminal)
```bash
# Terminal 2: Test API endpoints

# Test 1: Health check
curl http://localhost:8000/health

# Expected: {"status":"healthy","database":"connected","vector_store":"connected"}

# Test 2: API documentation
curl http://localhost:8000/

# Expected: {"message":"MedIntel Healthcare API","version":"1.0.0","status":"healthy","docs":"/docs"}

# Test 3: Register a new patient
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testpatient@example.com",
    "password": "testpass123",
    "full_name": "Test Patient",
    "role": "patient"
  }'

# Expected: {"id":5,"email":"testpatient@example.com","full_name":"Test Patient","role":"patient","is_active":true}

# Test 4: Login and get token
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=patient1@demo.com&password=password123" | \
  python -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

echo "Token received: ${TOKEN:0:20}..."

# Test 5: Test authenticated endpoint
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/patients/dashboard

# Expected: Patient dashboard data with vitals, appointments, etc.
```

### Step 5: Test Frontend Application

#### A. Start the Frontend Server
```bash
# Terminal 3: Start frontend
cd frontend
npm run dev
```

**Expected Output:**
```
   ▲ Next.js 14.0.3
   - Local:        http://localhost:3000
   - Network:      http://192.168.1.100:3000

 ✓ Ready in 2.1s
```

#### B. Test Frontend Functionality
```bash
# Test 1: Check homepage
curl http://localhost:3000

# Test 2: Open in browser
# Windows:
start http://localhost:3000

# macOS:
open http://localhost:3000

# Linux:
xdg-open http://localhost:3000
```

**Manual Testing Checklist:**
- [ ] Homepage loads correctly
- [ ] Navigation works
- [ ] Login page accessible at `/auth/login`
- [ ] Registration page accessible at `/auth/register`

### Step 6: End-to-End Testing Workflow

#### A. Patient Workflow Test
```bash
# Use the demo patient account
# Email: patient1@demo.com
# Password: password123

# Test patient login via browser:
# 1. Go to http://localhost:3000/auth/login
# 2. Login with demo credentials
# 3. Access patient dashboard
# 4. Try recording vitals
# 5. Test document upload
```

#### B. Clinic Workflow Test
```bash
# Use the demo clinic account  
# Email: doctor@demo.com
# Password: password123

# Test clinic login via browser:
# 1. Go to http://localhost:3000/auth/login
# 2. Login with clinic credentials
# 3. Access clinic dashboard
# 4. View patient list
# 5. Test patient detail views
```

#### C. API Integration Tests
```bash
# Test complete patient vitals workflow
cd backend

# 1. Login as patient
PATIENT_TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=patient1@demo.com&password=password123" | \
  python -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

# 2. Record new vitals
curl -X POST http://localhost:8000/api/v1/patients/vitals \
  -H "Authorization: Bearer $PATIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "blood_pressure_systolic": 125,
    "blood_pressure_diastolic": 82,
    "heart_rate": 74,
    "weight": 72.5,
    "blood_glucose_fasting": 105,
    "temperature": 36.7,
    "notes": "Feeling good today"
  }'

# Expected: Vitals record created with ID and timestamp

# 3. Get vitals history
curl -H "Authorization: Bearer $PATIENT_TOKEN" \
  "http://localhost:8000/api/v1/patients/vitals?days=7"

# Expected: Array of recent vitals records

# 4. Test clinic access to patient data
CLINIC_TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=doctor@demo.com&password=password123" | \
  python -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

# 5. Get patient list
curl -H "Authorization: Bearer $CLINIC_TOKEN" \
  http://localhost:8000/api/v1/clinic/patients

# Expected: List of patients with summary data

# 6. Get specific patient details  
curl -H "Authorization: Bearer $CLINIC_TOKEN" \
  http://localhost:8000/api/v1/clinic/patients/1

# Expected: Detailed patient information with recent vitals
```

### Step 7: Test AI Features

#### A. Test Document Processing (Mock)
```bash
# Create a test text file
echo "Patient: John Doe
Date: 2024-01-15
Blood Pressure: 140/90 mmHg
Heart Rate: 75 bpm
Weight: 80 kg
Glucose (fasting): 126 mg/dL
HbA1c: 7.2%
Total Cholesterol: 220 mg/dL" > test_report.txt

# Test document upload (requires file upload)
curl -X POST http://localhost:8000/api/v1/documents/upload \
  -H "Authorization: Bearer $PATIENT_TOKEN" \
  -F "file=@test_report.txt" \
  -F "report_type=lab_report"

# Expected: Document uploaded and processing started
```

#### B. Test Risk Prediction
```bash
# Test risk analysis for a patient
curl -X POST http://localhost:8000/api/v1/analytics/predict-risk/1 \
  -H "Authorization: Bearer $CLINIC_TOKEN"

# Expected: Risk predictions for 5 chronic diseases
```

#### C. Test Vector Search
```bash
# Test semantic document search
curl -H "Authorization: Bearer $PATIENT_TOKEN" \
  "http://localhost:8000/api/v1/documents/search?query=blood%20pressure%20results"

# Expected: Relevant documents based on semantic similarity
```

### Step 8: Performance and Load Testing

#### A. API Performance Test
```bash
# Install hey (HTTP load testing tool)
# Install via: go install github.com/rakyll/hey@latest
# Or download from: https://github.com/rakyll/hey/releases

# Test API performance
hey -n 100 -c 10 http://localhost:8000/health

# Expected output:
# Summary:
#   Total: X secs
#   Slowest: X secs  
#   Fastest: X secs
#   Average: X secs
#   Requests/sec: X
```

#### B. Database Performance Test
```bash
# Test database query performance
python -c "
import asyncio
import time
from app.database import AsyncSessionLocal
from app.models.models import Vitals
from sqlalchemy import select

async def test_db_performance():
    start_time = time.time()
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Vitals).limit(100))
        vitals = result.scalars().all()
        
    end_time = time.time()
    print(f'✅ Retrieved {len(vitals)} records in {end_time - start_time:.3f} seconds')

asyncio.run(test_db_performance())
"
```

### Step 9: Troubleshooting Common Issues

#### A. Database Connection Issues
```bash
# Check database URL format
echo $DATABASE_URL

# Test manual connection
python -c "
import psycopg2
from urllib.parse import urlparse
import os

url = os.getenv('DATABASE_URL')
if '+asyncpg' in url:
    url = url.replace('+asyncpg', '')

try:
    conn = psycopg2.connect(url)
    print('✅ Direct PostgreSQL connection successful')
    conn.close()
except Exception as e:
    print(f'❌ Database connection failed: {e}')
"
```

#### B. Missing Dependencies
```bash
# Check for missing Python packages
python -c "
required_packages = [
    'fastapi', 'uvicorn', 'sqlalchemy', 'alembic',
    'qdrant_client', 'sentence_transformers', 
    'paddleocr', 'pytesseract', 'openai'
]

for package in required_packages:
    try:
        __import__(package)
        print(f'✅ {package} installed')
    except ImportError:
        print(f'❌ {package} missing - run: pip install {package}')
"

# Check Node.js dependencies  
cd frontend
npm list --depth=0 2>/dev/null | grep -E "(missing|UNMET)" || echo "✅ All npm packages installed"
```

#### C. Service Status Check
```bash
# Check all services are running
echo "🔍 Service Status Check:"

# API Server
curl -s http://localhost:8000/health > /dev/null && echo "✅ API Server (8000)" || echo "❌ API Server (8000)"

# Frontend Server  
curl -s http://localhost:3000 > /dev/null && echo "✅ Frontend Server (3000)" || echo "❌ Frontend Server (3000)"

# Redis (if using)
redis-cli ping 2>/dev/null && echo "✅ Redis Server" || echo "❌ Redis Server (optional)"
```

### Step 10: Development Workflow Testing

#### A. Hot Reload Testing
```bash
# Test backend hot reload
# 1. Make a small change to backend/main.py (add a comment)
# 2. Check if server reloads automatically
# Expected: "INFO: Application startup complete." message

# Test frontend hot reload  
# 1. Make a small change to frontend/src/app/page.tsx
# 2. Check if browser refreshes automatically
# Expected: Page updates without manual refresh
```

#### B. API Documentation Testing
```bash
# Test interactive API docs
echo "📚 API Documentation available at:"
echo "   Swagger UI: http://localhost:8000/docs"
echo "   ReDoc: http://localhost:8000/redoc"

# Open API docs
# Windows:
start http://localhost:8000/docs

# macOS:  
open http://localhost:8000/docs

# Linux:
xdg-open http://localhost:8000/docs
```

## ✅ Success Criteria

Your setup is successful when:

1. **Backend Tests Pass:**
   - [ ] Configuration loads without errors
   - [ ] Database connection established
   - [ ] Qdrant vector database connects
   - [ ] Sample data created successfully
   - [ ] API server starts on port 8000
   - [ ] Health endpoint returns success
   - [ ] Authentication endpoints work

2. **Frontend Tests Pass:**
   - [ ] Next.js server starts on port 3000
   - [ ] Homepage loads correctly
   - [ ] Navigation works
   - [ ] Login/registration pages accessible

3. **Integration Tests Pass:**
   - [ ] Patient can register and login
   - [ ] Vitals can be recorded and retrieved
   - [ ] Clinic dashboard shows patient data
   - [ ] API authentication works
   - [ ] File upload processes correctly

4. **AI Features Work:**
   - [ ] OCR service initializes
   - [ ] LLM extraction works
   - [ ] Vector search functional
   - [ ] Risk prediction generates results

## 🎯 Next Steps

After successful testing:

1. **Customize for your needs:**
   - Add more patient conditions
   - Customize risk prediction models
   - Add more notification types

2. **Deploy to production:**
   - Set up CI/CD pipeline
   - Configure production database
   - Set up monitoring and logging

3. **Enhance features:**
   - Add more AI agents
   - Implement real telehealth integration
   - Add mobile app support

## 📞 Getting Help

If tests fail:

1. **Check the logs:**
   - Backend: Terminal running uvicorn
   - Frontend: Terminal running npm run dev
   - Database: Check connection strings

2. **Common solutions:**
   - Restart services
   - Check environment variables
   - Verify dependencies installed
   - Check network connectivity

3. **Report issues:**
   - Include error messages
   - Specify which test failed
   - Share relevant logs

**Happy testing! 🧪✨**