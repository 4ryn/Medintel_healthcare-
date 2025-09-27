from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
import os
from contextlib import asynccontextmanager

from app.config import settings
from app.database import engine, Base
from app.routes import auth, patients, clinic, documents, notifications, analytics, vitals, appointments, care_plans, ai_insights, support
from app.middleware import LoggingMiddleware
from app.services.llm_extraction_service import LLMExtractionService  # Import the LLM extraction service
from fastapi.responses import JSONResponse  # Import JSONResponse


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    print("🚀 Starting MedIntel Healthcare API...")
    
    # Create database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Initialize Qdrant collection
    from app.services.vector_service import VectorService
    vector_service = VectorService()
    await vector_service.initialize_collection()
    
    print("✅ Database and vector store initialized")
    
    yield
    
    # Shutdown
    print("🛑 Shutting down MedIntel Healthcare API...")


app = FastAPI(
    title="MedIntel Healthcare API",
    description="AI-Powered Healthcare Management System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(LoggingMiddleware)

# Create upload directory
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Routes
app.include_router(auth.router, prefix="/api/v1/auth", tags=["authentication"])
app.include_router(patients.router, prefix="/api/v1/patients", tags=["patients"])
app.include_router(clinic.router, prefix="/api/v1/clinic", tags=["clinic"])
app.include_router(documents.router, prefix="/api/v1/documents", tags=["documents"])
app.include_router(vitals.router, prefix="/api/v1/vitals", tags=["vitals"])
app.include_router(appointments.router, prefix="/api/v1/appointments", tags=["appointments"])
app.include_router(care_plans.router, prefix="/api/v1/care-plans", tags=["care-plans"])
app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["notifications"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["analytics"])
app.include_router(ai_insights.router, prefix="/api/v1/ai", tags=["ai-insights"])
app.include_router(support.router, prefix="/api/v1/support", tags=["support"])


@app.get("/")
async def root():
    return {
        "message": "MedIntel Healthcare API",
        "version": "1.0.0",
        "status": "healthy",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "vector_store": "connected"
    }


@app.post("/api/v1/llm-extraction")
async def llm_extraction(file: UploadFile = File(...)):
    """
    Endpoint for LLM-based data extraction.
    Accepts a file and extracts information using the LLM.
    Returns JSON response for frontend integration.
    """
    # Validate file type - now including image formats
    allowed_types = [
        "application/pdf", 
        "text/plain",
        "image/jpeg",
        "image/jpg", 
        "image/png",
        "image/tiff",
        "image/bmp"
    ]
    
    if file.content_type not in allowed_types:
        return {
            "success": False,
            "error": "Unsupported file type. Only PDF, text files, and images (JPG, PNG, TIFF, BMP) are allowed.",
            "supported_types": allowed_types
        }
    
    llm_service = LLMExtractionService()
    try:
        result = await llm_service.extract(file)
        
        # Check if extraction failed
        if "error" in result:
            return {
                "success": False,
                "error": result["error"],
                "extraction_status": result.get("extraction_status", "failed"),
                "file_info": {
                    "filename": file.filename,
                    "content_type": file.content_type,
                    "size": file.size
                }
            }
        
        # Successful extraction
        return {
            "success": True,
            "data": {
                "Extracted Medical Data": result
            },
            "file_info": {
                "filename": file.filename,
                "content_type": file.content_type,
                "size": file.size
            },
            "extraction_status": "success"
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to process file: {str(e)}",
            "file_info": {
                "filename": file.filename,
                "content_type": file.content_type
            }
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.ENVIRONMENT == "development"
    )