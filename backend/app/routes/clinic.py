from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.database import get_db
from app.routes.auth import get_current_active_user
from app.models.models import User, Patient, Vitals, RiskScore

router = APIRouter()


# Pydantic schemas
class PatientSummary(BaseModel):
    id: int
    full_name: str
    email: str
    last_vitals_date: Optional[datetime]
    risk_level: str
    medical_conditions: Optional[List[str]]
    
    class Config:
        from_attributes = True


class PatientDetails(BaseModel):
    id: int
    full_name: str
    email: str
    date_of_birth: Optional[datetime]
    gender: Optional[str]
    phone: Optional[str]
    medical_conditions: Optional[List[str]]
    recent_vitals: List[dict]
    risk_scores: List[dict]
    
    class Config:
        from_attributes = True


@router.get("/patients", response_model=List[PatientSummary])
async def get_patients_list(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    risk_filter: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get list of patients for clinic dashboard with filtering and search"""
    if current_user.role not in ["clinic_admin", "clinician"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    from sqlalchemy import select, and_, or_
    from sqlalchemy.orm import selectinload
    
    # Base query
    query = select(Patient).options(
        selectinload(Patient.user),
        selectinload(Patient.vitals),
        selectinload(Patient.risk_scores)
    )
    
    # Add search filter
    if search:
        query = query.join(Patient.user).filter(
            or_(
                User.full_name.ilike(f"%{search}%"),
                User.email.ilike(f"%{search}%")
            )
        )
    
    # Add pagination
    query = query.offset(skip).limit(limit)
    
    result = await db.execute(query)
    patients = result.scalars().all()
    
    # Transform to response format
    patients_summary = []
    for patient in patients:
        # Get latest vitals date
        latest_vitals_date = None
        if patient.vitals:
            latest_vitals_date = max(v.recorded_at for v in patient.vitals)
        
        # Calculate risk level
        risk_level = "low"
        if patient.risk_scores:
            avg_risk = sum(rs.risk_percentage for rs in patient.risk_scores) / len(patient.risk_scores)
            if avg_risk > 70:
                risk_level = "high"
            elif avg_risk > 40:
                risk_level = "medium"
        
        patients_summary.append(PatientSummary(
            id=patient.id,
            full_name=patient.user.full_name,
            email=patient.user.email,
            last_vitals_date=latest_vitals_date,
            risk_level=risk_level,
            medical_conditions=patient.medical_conditions or []
        ))
    
    return patients_summary


@router.get("/patients/{patient_id}", response_model=PatientDetails)
async def get_patient_details(
    patient_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get detailed information about a specific patient"""
    if current_user.role not in ["clinic_admin", "clinician"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    from sqlalchemy import select
    from sqlalchemy.orm import selectinload
    
    result = await db.execute(
        select(Patient)
        .options(
            selectinload(Patient.user),
            selectinload(Patient.vitals),
            selectinload(Patient.risk_scores)
        )
        .filter(Patient.id == patient_id)
    )
    patient = result.scalar_one_or_none()
    
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Get recent vitals (last 10)
    recent_vitals = sorted(patient.vitals, key=lambda x: x.recorded_at, reverse=True)[:10]
    recent_vitals_data = [
        {
            "id": v.id,
            "recorded_at": v.recorded_at,
            "blood_pressure": f"{v.blood_pressure_systolic}/{v.blood_pressure_diastolic}" if v.blood_pressure_systolic else None,
            "heart_rate": v.heart_rate,
            "weight": v.weight,
            "blood_glucose_fasting": v.blood_glucose_fasting
        }
        for v in recent_vitals
    ]
    
    # Get risk scores
    risk_scores_data = [
        {
            "disease_type": rs.disease_type,
            "risk_percentage": rs.risk_percentage,
            "calculated_at": rs.calculated_at
        }
        for rs in patient.risk_scores
    ]
    
    return PatientDetails(
        id=patient.id,
        full_name=patient.user.full_name,
        email=patient.user.email,
        date_of_birth=patient.date_of_birth,
        gender=patient.gender,
        phone=patient.phone,
        medical_conditions=patient.medical_conditions or [],
        recent_vitals=recent_vitals_data,
        risk_scores=risk_scores_data
    )


@router.get("/analytics/overview")
async def get_clinic_analytics(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get clinic analytics overview"""
    if current_user.role not in ["clinic_admin", "clinician"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    from sqlalchemy import select, func, and_
    from datetime import timedelta
    
    # Total patients
    total_patients_result = await db.execute(
        select(func.count(Patient.id))
    )
    total_patients = total_patients_result.scalar()
    
    # Active patients (with vitals in last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    active_patients_result = await db.execute(
        select(func.count(func.distinct(Vitals.patient_id)))
        .filter(Vitals.recorded_at >= thirty_days_ago)
    )
    active_patients = active_patients_result.scalar()
    
    # High-risk patients
    high_risk_result = await db.execute(
        select(func.count(func.distinct(RiskScore.patient_id)))
        .filter(RiskScore.risk_percentage > 70)
    )
    high_risk_patients = high_risk_result.scalar()
    
    return {
        "total_patients": total_patients,
        "active_patients": active_patients,
        "high_risk_patients": high_risk_patients,
        "engagement_rate": round((active_patients / total_patients * 100) if total_patients > 0 else 0, 1)
    }