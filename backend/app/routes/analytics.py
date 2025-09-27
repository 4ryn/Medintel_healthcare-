from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any
from pydantic import BaseModel
from datetime import datetime, timedelta

from app.database import get_db
from app.routes.auth import get_current_active_user
from app.models.models import User, Patient, RiskScore, Vitals

router = APIRouter()


class RiskAnalysisResponse(BaseModel):
    disease_type: str
    risk_percentage: float
    risk_level: str
    contributing_factors: List[str]
    recommendations: List[str]
    confidence_score: float


class PredictiveAnalytics(BaseModel):
    patient_id: int
    risk_analyses: List[RiskAnalysisResponse]
    trend_analysis: Dict[str, Any]
    generated_at: datetime


@router.post("/predict-risk/{patient_id}")
async def predict_patient_risk(
    patient_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Generate risk predictions for all 5 chronic diseases for a patient"""
    if current_user.role not in ["clinic_admin", "clinician"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get patient
    from sqlalchemy import select
    patient_result = await db.execute(
        select(Patient).filter(Patient.id == patient_id)
    )
    patient = patient_result.scalar_one_or_none()
    
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Get recent vitals for prediction
    vitals_result = await db.execute(
        select(Vitals)
        .filter(Vitals.patient_id == patient_id)
        .order_by(Vitals.recorded_at.desc())
        .limit(10)
    )
    recent_vitals = vitals_result.scalars().all()
    
    if not recent_vitals:
        raise HTTPException(status_code=400, detail="No vitals data available for prediction")
    
    # TODO: Implement actual ML model predictions
    # For now, return mock predictions
    diseases = ["diabetes", "hypertension", "heart_disease", "copd", "ckd"]
    risk_analyses = []
    
    for disease in diseases:
        # Mock risk calculation based on recent vitals
        risk_percentage = min(85.0, max(10.0, hash(f"{patient_id}_{disease}") % 80 + 10))
        
        if risk_percentage > 70:
            risk_level = "high"
        elif risk_percentage > 40:
            risk_level = "medium"
        else:
            risk_level = "low"
        
        risk_analyses.append(RiskAnalysisResponse(
            disease_type=disease,
            risk_percentage=risk_percentage,
            risk_level=risk_level,
            contributing_factors=[
                "Elevated blood pressure",
                "BMI above normal range",
                "Family history"
            ],
            recommendations=[
                "Regular monitoring",
                "Lifestyle modifications",
                "Medication adherence"
            ],
            confidence_score=0.85
        ))
    
    # Calculate trend analysis
    trend_analysis = {
        "blood_pressure_trend": "increasing",
        "weight_trend": "stable",
        "glucose_trend": "decreasing"
    }
    
    return PredictiveAnalytics(
        patient_id=patient_id,
        risk_analyses=risk_analyses,
        trend_analysis=trend_analysis,
        generated_at=datetime.utcnow()
    )


@router.get("/population-insights")
async def get_population_insights(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get population-level health insights for the clinic"""
    if current_user.role not in ["clinic_admin", "clinician"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    from sqlalchemy import select, func
    
    # Get disease distribution
    disease_distribution = {}
    for disease in ["diabetes", "hypertension", "heart_disease", "copd", "ckd"]:
        result = await db.execute(
            select(func.avg(RiskScore.risk_percentage))
            .filter(RiskScore.disease_type == disease)
        )
        avg_risk = result.scalar() or 0
        disease_distribution[disease] = round(avg_risk, 2)
    
    # Get vitals trends
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    vitals_count_result = await db.execute(
        select(func.count(Vitals.id))
        .filter(Vitals.recorded_at >= thirty_days_ago)
    )
    recent_vitals_count = vitals_count_result.scalar()
    
    return {
        "disease_risk_distribution": disease_distribution,
        "recent_vitals_submissions": recent_vitals_count,
        "high_risk_patients_count": 0,  # TODO: Calculate from actual data
        "engagement_metrics": {
            "monthly_active_patients": 0,
            "average_vitals_per_patient": 0
        }
    }


@router.get("/trends/{patient_id}")
async def get_patient_trends(
    patient_id: int,
    days: int = 90,
    db: AsyncSession = Depends(get_db)
):
    """Get trend analysis for a specific patient"""
    
    from sqlalchemy import select
    
    # Get vitals data for the specified period
    start_date = datetime.utcnow() - timedelta(days=days)
    vitals_result = await db.execute(
        select(Vitals)
        .filter(Vitals.patient_id == patient_id)
        .filter(Vitals.recorded_at >= start_date)
        .order_by(Vitals.recorded_at)
    )
    vitals = vitals_result.scalars().all()
    
    if not vitals:
        return {"message": "No vitals data available for the specified period"}
    
    # Calculate trends
    trends = {
        "blood_pressure": {
            "data": [
                {
                    "date": v.recorded_at.isoformat(),
                    "systolic": v.blood_pressure_systolic,
                    "diastolic": v.blood_pressure_diastolic
                }
                for v in vitals if v.blood_pressure_systolic
            ]
        },
        "weight": {
            "data": [
                {
                    "date": v.recorded_at.isoformat(),
                    "value": v.weight
                }
                for v in vitals if v.weight
            ]
        },
        "glucose": {
            "data": [
                {
                    "date": v.recorded_at.isoformat(),
                    "fasting": v.blood_glucose_fasting,
                    "post_meal": v.blood_glucose_post_meal
                }
                for v in vitals if v.blood_glucose_fasting or v.blood_glucose_post_meal
            ]
        }
    }
    
    return trends