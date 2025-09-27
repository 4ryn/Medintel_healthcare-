"""
Document Upload and Processing API Routes
Handles medical document upload, OCR processing, and AI extraction
"""

import os
import shutil
import uuid
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, Form
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import and_, select
from pydantic import BaseModel
from datetime import datetime

from ..database import get_db
from ..models.models import User, Patient, Document, DocumentType
from ..routes.auth import get_current_user
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(tags=["documents"])

# Allowed file extensions
ALLOWED_EXTENSIONS = {'.pdf', '.jpg', '.jpeg', '.png', '.bmp', '.tiff'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


class DocumentResponse(BaseModel):
    id: int
    filename: str
    document_type: str
    description: Optional[str]
    file_size: int
    processing_status: str
    processing_error: Optional[str]
    upload_date: Optional[datetime]
    has_extracted_text: bool
    
    class Config:
        from_attributes = True


def validate_file(file: UploadFile) -> bool:
    """Validate uploaded file"""
    if not file.filename:
        return False
    
    file_extension = os.path.splitext(file.filename)[1].lower()
    return file_extension in ALLOWED_EXTENSIONS

def save_uploaded_file(file: UploadFile, upload_dir: str) -> str:
    """Save uploaded file and return file path"""
    # Create upload directory if it doesn't exist
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1].lower()
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(upload_dir, unique_filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return file_path

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    document_type: str = Form(...),
    description: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> JSONResponse:
    """Upload a medical document"""
    try:
        logger.info(f"📄 Document upload started by user {current_user.email}")
        
        # Validate file
        if not validate_file(file):
            raise HTTPException(
                status_code=400,
                detail="Invalid file type. Supported formats: PDF, JPG, JPEG, PNG, BMP, TIFF"
            )
        
        # Check file size
        file.file.seek(0, 2)  # Seek to end
        file_size = file.file.tell()
        file.file.seek(0)  # Reset to beginning
        
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Maximum size is {MAX_FILE_SIZE / (1024*1024):.1f}MB"
            )
        
        # Get user's patient record
        patient_result = await db.execute(
            select(Patient).filter(Patient.user_id == current_user.id)
        )
        patient = patient_result.scalar_one_or_none()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient record not found")
        
        # Validate document type
        valid_doc_types = [doc_type.value for doc_type in DocumentType]
        if document_type not in valid_doc_types:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid document type. Valid types: {', '.join(valid_doc_types)}"
            )
        
        # Save uploaded file
        upload_dir = os.path.join("uploads", "documents", str(current_user.id))
        file_path = save_uploaded_file(file, upload_dir)
        
        # Create document record in database
        document = Document(
            filename=file.filename,
            file_path=file_path,
            file_size=file_size,
            document_type=document_type,
            description=description,
            patient_id=patient.id,
            processing_status="uploaded"
        )
        
        db.add(document)
        await db.commit()
        await db.refresh(document)
        
        logger.info(f"✅ Document saved with ID: {document.id}")
        
        return JSONResponse(
            status_code=201,
            content={
                "message": "Document uploaded successfully",
                "document_id": document.id,
                "filename": file.filename,
                "status": "uploaded",
                "file_size": file_size
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Document upload failed: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.get("/", response_model=List[DocumentResponse])
async def get_user_documents(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> List[DocumentResponse]:
    """Get all documents for the current user"""
    try:
        # Get user's patient record
        patient_result = await db.execute(
            select(Patient).filter(Patient.user_id == current_user.id)
        )
        patient = patient_result.scalar_one_or_none()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient record not found")
        
        # Get documents
        documents_result = await db.execute(
            select(Document)
            .filter(Document.patient_id == patient.id)
            .offset(skip)
            .limit(limit)
        )
        documents = documents_result.scalars().all()
        
        return [
            DocumentResponse(
                id=doc.id,
                filename=doc.filename,
                document_type=doc.document_type,
                description=doc.description,
                file_size=doc.file_size,
                processing_status=doc.processing_status,
                processing_error=doc.processing_error,
                upload_date=doc.upload_date,
                has_extracted_text=bool(doc.extracted_text)
            )
            for doc in documents
        ]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error fetching documents: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch documents: {str(e)}")

@router.get("/{document_id}")
async def get_document(
    document_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get detailed information about a specific document"""
    try:
        # Get user's patient record
        patient_result = await db.execute(
            select(Patient).filter(Patient.user_id == current_user.id)
        )
        patient = patient_result.scalar_one_or_none()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient record not found")
        
        # Get document
        document_result = await db.execute(
            select(Document).filter(
                and_(
                    Document.id == document_id,
                    Document.patient_id == patient.id
                )
            )
        )
        document = document_result.scalar_one_or_none()
        
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        return {
            "id": document.id,
            "filename": document.filename,
            "document_type": document.document_type,
            "description": document.description,
            "file_size": document.file_size,
            "processing_status": document.processing_status,
            "processing_error": document.processing_error,
            "upload_date": document.upload_date.isoformat() if document.upload_date else None,
            "extracted_text": document.extracted_text
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error fetching document {document_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch document: {str(e)}")

@router.get("/search")
async def search_documents(
    query: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Search documents using semantic search"""
    try:
        # Get patient
        patient_result = await db.execute(
            select(Patient).filter(Patient.user_id == current_user.id)
        )
        patient = patient_result.scalar_one_or_none()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient profile not found")
        
        # TODO: Implement semantic search using Qdrant
        return {
            "query": query,
            "results": [],
            "message": "Semantic search will be implemented with Qdrant vector database"
        }
        
    except Exception as e:
        logger.error(f"❌ Error searching documents: {e}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@router.get("/types/")
async def get_document_types() -> List[str]:
    """Get list of available document types"""
    return [doc_type.value for doc_type in DocumentType]