"""
Patient Management API Routes
Handles patient profiles, medical history, and care coordination
"""

from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, and_, or_
from pydantic import BaseModel, Field, EmailStr
from datetime import datetime, date
import logging

from app.database import get_db
from app.models.models import User, Patient, Vitals, Document
from app.routes.auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(tags=["patients"])


class PatientProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    blood_type: Optional[str] = None
    allergies: Optional[str] = None
    chronic_conditions: Optional[str] = None
    medications: Optional[str] = None
    insurance_provider: Optional[str] = None
    insurance_policy_number: Optional[str] = None


class VitalsCreate(BaseModel):
    type: str = Field(..., description="Type of vital sign")
    value: float = Field(..., description="Numeric value of the vital sign")
    unit: str = Field(..., description="Unit of measurement")
    recorded_at: datetime = Field(default_factory=datetime.now, description="When the vital was recorded")
    notes: Optional[str] = Field(None, description="Additional notes")
    status: str = Field(default="normal", description="Status: normal, warning, critical")


class VitalsResponse(BaseModel):
    id: int
    type: str
    value: float
    unit: str
    recorded_at: datetime
    notes: Optional[str]
    status: str
    
    class Config:
        from_attributes = True


class PatientProfileResponse(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    blood_type: Optional[str] = None
    allergies: Optional[str] = None
    chronic_conditions: Optional[str] = None
    medications: Optional[str] = None
    insurance_provider: Optional[str] = None
    insurance_policy_number: Optional[str] = None


class PatientProfileResponse(BaseModel):
    id: int
    user_id: int
    first_name: str
    last_name: str
    date_of_birth: Optional[date]
    gender: Optional[str]
    phone: Optional[str]
    address: Optional[str]
    emergency_contact_name: Optional[str]
    emergency_contact_phone: Optional[str]
    blood_type: Optional[str]
    allergies: Optional[str]
    chronic_conditions: Optional[str]
    medications: Optional[str]
    insurance_provider: Optional[str]
    insurance_policy_number: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class MedicalHistoryEntry(BaseModel):
    id: int
    date: datetime
    type: str  # "vital", "document", "appointment", "medication"
    description: str
    value: Optional[str]
    status: Optional[str]
    provider: Optional[str]
    
    class Config:
        from_attributes = True


class PatientDashboardData(BaseModel):
    profile: PatientProfileResponse
    recent_vitals: List[Dict[str, Any]]
    recent_documents: List[Dict[str, Any]]
    upcoming_appointments: List[Dict[str, Any]]
    active_medications: List[str]
    health_alerts: List[Dict[str, Any]]
    care_plan_progress: Dict[str, Any]


@router.get("/dashboard")
async def get_patient_dashboard(
    db: AsyncSession = Depends(get_db)
):
    """Get patient dashboard with recent vitals, appointments, and alerts"""
    # Use patient ID 1 for testing
    patient_id = 1
    
    # Get patient profile
    patient_result = await db.execute(
        select(Patient).filter(Patient.id == patient_id)
    )
    patient = patient_result.scalar_one_or_none()
    
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    
    # Get recent vitals (last 10 entries)
    vitals_result = await db.execute(
        select(Vitals)
        .filter(Vitals.patient_id == patient.id)
        .order_by(Vitals.recorded_at.desc())
        .limit(10)
    )
    recent_vitals = vitals_result.scalars().all()
    
    # TODO: Get upcoming appointments and medication reminders
    # This will be implemented when we add those features
    
    return {
        "recent_vitals": recent_vitals,
        "upcoming_appointments": [],
        "medication_reminders": [],
        "risk_alerts": []
    }


@router.post("/vitals", response_model=VitalsResponse)
async def record_vitals(
    vitals_data: VitalsCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Record new vital signs for the patient"""
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get patient profile
    patient_result = await db.execute(
        select(Patient).filter(Patient.user_id == current_user.id)
    )
    patient = patient_result.scalar_one_or_none()
    
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    
    # Create new vitals record
    db_vitals = Vitals(
        patient_id=patient.id,
        **vitals_data.dict()
    )
    db.add(db_vitals)
    await db.commit()
    await db.refresh(db_vitals)
    
    # TODO: Trigger anomaly detection and alerts
    
    return db_vitals


@router.get("/vitals", response_model=List[VitalsResponse])
async def get_vitals_history(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get patient's vitals history for the specified number of days"""
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get patient profile
    patient_result = await db.execute(
        select(Patient).filter(Patient.user_id == current_user.id)
    )
    patient = patient_result.scalar_one_or_none()
    
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    
    # Get vitals from the last N days
    from datetime import timedelta
    start_date = datetime.utcnow() - timedelta(days=days)
    
    vitals_result = await db.execute(
        select(Vitals)
        .filter(Vitals.patient_id == patient.id)
        .filter(Vitals.recorded_at >= start_date)
        .order_by(Vitals.recorded_at.desc())
    )
    vitals = vitals_result.scalars().all()
    
    return vitals


@router.post("/upload-document")
async def upload_medical_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Upload and process medical documents (lab reports, prescriptions, etc.)"""
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Validate file type
    allowed_types = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400, 
            detail="Invalid file type. Only PDF and image files are allowed."
        )
    
    # TODO: Save file, process with OCR, extract data with LLM
    # This will be implemented in the document processing service
    
    return {
        "message": "Document uploaded successfully",
        "filename": file.filename,
        "content_type": file.content_type,
        "status": "processing"
    }


@router.put("/profile", response_model=dict)
async def update_patient_profile(
    profile_update: PatientProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update patient profile information"""
    try:
        # Get patient record
        patient_result = await db.execute(
            select(Patient).filter(Patient.user_id == current_user.id)
        )
        patient = patient_result.scalar_one_or_none()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient profile not found")

        # Update patient fields
        if profile_update.phone:
            patient.phone = profile_update.phone
        if profile_update.address:
            patient.address = profile_update.address
        if profile_update.emergency_contact_name:
            patient.emergency_contact_name = profile_update.emergency_contact_name
        if profile_update.emergency_contact_phone:
            patient.emergency_contact_phone = profile_update.emergency_contact_phone
        if profile_update.medical_conditions is not None:
            patient.medical_conditions = profile_update.medical_conditions
        if profile_update.allergies is not None:
            patient.allergies = profile_update.allergies
        if profile_update.current_medications is not None:
            patient.current_medications = profile_update.current_medications

        await db.commit()
        await db.refresh(patient)

        return {
            "success": True,
            "message": "Profile updated successfully",
            "patient_id": patient.id
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error updating patient profile: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update profile: {str(e)}")


@router.get("/profile", response_model=dict)
async def get_patient_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get current patient profile information"""
    try:
        # Get patient record
        patient_result = await db.execute(
            select(Patient).filter(Patient.user_id == current_user.id)
        )
        patient = patient_result.scalar_one_or_none()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient profile not found")

        return {
            "success": True,
            "profile": {
                "id": patient.id,
                "full_name": f"{patient.first_name} {patient.last_name}",
                "first_name": patient.first_name,
                "last_name": patient.last_name,
                "date_of_birth": patient.date_of_birth.isoformat() if patient.date_of_birth else None,
                "gender": patient.gender,
                "phone": patient.phone,
                "address": patient.address,
                "emergency_contact_name": patient.emergency_contact_name,
                "emergency_contact_phone": patient.emergency_contact_phone,
                "medical_conditions": patient.medical_conditions or [],
                "allergies": patient.allergies or [],
                "current_medications": patient.current_medications or [],
                "created_at": patient.created_at.isoformat() if patient.created_at else None,
                "updated_at": patient.updated_at.isoformat() if patient.updated_at else None
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error fetching patient profile: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch profile: {str(e)}")