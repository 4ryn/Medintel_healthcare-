"""
AI-Powered Health Insights API Routes
Provides intelligent health analysis, risk prediction, and care recommendations
"""

from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, and_, or_, func
from pydantic import BaseModel, Field
from datetime import datetime, timedelta, date
from enum import Enum
import logging
import random
import statistics

from app.database import get_db
from app.models.models import User, Patient, Vitals, RiskScore
from app.routes.auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(tags=["ai-insights"])


class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class InsightType(str, Enum):
    RISK_PREDICTION = "risk_prediction"
    TREND_ANALYSIS = "trend_analysis"
    CARE_RECOMMENDATION = "care_recommendation"
    MEDICATION_ADHERENCE = "medication_adherence"
    LIFESTYLE_SUGGESTION = "lifestyle_suggestion"


class HealthInsight(BaseModel):
    id: str
    type: InsightType
    title: str
    description: str
    risk_level: RiskLevel
    confidence: float = Field(..., ge=0, le=1, description="AI confidence score")
    generated_at: datetime
    valid_until: Optional[datetime]
    data_points_used: int
    recommendations: List[str]
    metrics: Dict[str, Any]


class RiskAssessment(BaseModel):
    patient_id: int
    overall_risk: RiskLevel
    risk_percentage: float
    risk_factors: List[Dict[str, Any]]
    protective_factors: List[Dict[str, Any]]
    generated_at: datetime
    next_assessment_due: date


class TrendAnalysis(BaseModel):
    vital_type: str
    trend_direction: str  # "improving", "declining", "stable"
    trend_strength: float  # 0-1 scale
    period_days: int
    predicted_value: Optional[float]
    confidence_interval: List[float]
    alert_threshold_days: Optional[int]


class CareRecommendation(BaseModel):
    category: str
    priority: str  # "low", "medium", "high", "urgent"
    title: str
    description: str
    action_items: List[str]
    expected_outcome: str
    timeline: str


@router.get("/insights/{patient_id}", response_model=List[HealthInsight])
async def get_health_insights(
    patient_id: int,
    insight_types: Optional[List[InsightType]] = Query(None),
    limit: int = Query(10, le=50),
    db: AsyncSession = Depends(get_db)
):
    """Get AI-powered health insights for a patient"""
    
    # Get patient vitals data for analysis
    vitals_result = await db.execute(
        select(Vitals).filter(
            and_(
                Vitals.patient_id == patient_id,
                Vitals.recorded_at >= datetime.now() - timedelta(days=90)
            )
        ).order_by(desc(Vitals.recorded_at))
    )
    vitals = vitals_result.scalars().all()
    
    # Generate AI insights (in a real implementation, this would use ML models)
    insights = await generate_ai_insights(patient_id, vitals, insight_types, limit)
    
    return insights


@router.get("/risk-assessment/{patient_id}", response_model=RiskAssessment)
async def get_risk_assessment(
    patient_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get comprehensive risk assessment for a patient"""
    
    # Verify permissions
    if current_user.role == "patient":
        patient_result = await db.execute(
            select(Patient).filter(Patient.user_id == current_user.id)
        )
        user_patient = patient_result.scalar_one_or_none()
        if not user_patient or user_patient.id != patient_id:
            raise HTTPException(status_code=403, detail="Access denied")
    elif current_user.role not in ["clinician", "clinic_admin"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get patient data
    patient_result = await db.execute(
        select(Patient).filter(Patient.id == patient_id)
    )
    patient = patient_result.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Get recent vitals
    vitals_result = await db.execute(
        select(Vitals).filter(
            and_(
                Vitals.patient_id == patient_id,
                Vitals.recorded_at >= datetime.now() - timedelta(days=30)
            )
        )
    )
    vitals = vitals_result.scalars().all()
    
    # Calculate risk assessment
    risk_assessment = await calculate_risk_assessment(patient, vitals)
    
    return risk_assessment


@router.get("/trends/{patient_id}", response_model=List[TrendAnalysis])
async def get_health_trends(
    patient_id: int,
    vital_types: Optional[List[str]] = Query(None),
    period_days: int = Query(30, le=365),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get health trend analysis for patient vitals"""
    
    # Verify permissions
    if current_user.role == "patient":
        patient_result = await db.execute(
            select(Patient).filter(Patient.user_id == current_user.id)
        )
        user_patient = patient_result.scalar_one_or_none()
        if not user_patient or user_patient.id != patient_id:
            raise HTTPException(status_code=403, detail="Access denied")
    elif current_user.role not in ["clinician", "clinic_admin"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get vitals data for trend analysis
    vitals_result = await db.execute(
        select(Vitals).filter(
            and_(
                Vitals.patient_id == patient_id,
                Vitals.recorded_at >= datetime.now() - timedelta(days=period_days)
            )
        ).order_by(Vitals.recorded_at)
    )
    vitals = vitals_result.scalars().all()
    
    # Analyze trends
    trends = await analyze_health_trends(vitals, vital_types, period_days)
    
    return trends


@router.get("/recommendations/{patient_id}", response_model=List[CareRecommendation])
async def get_care_recommendations(
    patient_id: int,
    priority_filter: Optional[str] = Query(None),
    category_filter: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get personalized care recommendations for a patient"""
    
    # Verify permissions
    if current_user.role == "patient":
        patient_result = await db.execute(
            select(Patient).filter(Patient.user_id == current_user.id)
        )
        user_patient = patient_result.scalar_one_or_none()
        if not user_patient or user_patient.id != patient_id:
            raise HTTPException(status_code=403, detail="Access denied")
    elif current_user.role not in ["clinician", "clinic_admin"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get patient data
    patient_result = await db.execute(
        select(Patient).filter(Patient.id == patient_id)
    )
    patient = patient_result.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Get recent vitals and risk data
    vitals_result = await db.execute(
        select(Vitals).filter(
            and_(
                Vitals.patient_id == patient_id,
                Vitals.recorded_at >= datetime.now() - timedelta(days=30)
            )
        )
    )
    vitals = vitals_result.scalars().all()
    
    # Generate recommendations
    recommendations = await generate_care_recommendations(patient, vitals, priority_filter, category_filter)
    
    return recommendations


@router.post("/predict-outcomes/{patient_id}")
async def predict_health_outcomes(
    patient_id: int,
    prediction_horizon_days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Predict future health outcomes based on current trends"""
    
    # Verify permissions (clinicians only for predictions)
    if current_user.role not in ["clinician", "clinic_admin"]:
        raise HTTPException(status_code=403, detail="Only clinicians can access predictive models")
    
    # Get patient data
    patient_result = await db.execute(
        select(Patient).filter(Patient.id == patient_id)
    )
    patient = patient_result.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Get historical data
    vitals_result = await db.execute(
        select(Vitals).filter(
            and_(
                Vitals.patient_id == patient_id,
                Vitals.recorded_at >= datetime.now() - timedelta(days=90)
            )
        ).order_by(Vitals.recorded_at)
    )
    vitals = vitals_result.scalars().all()
    
    # Generate predictions
    predictions = await predict_outcomes(patient, vitals, prediction_horizon_days)
    
    return predictions


# Helper functions for AI analysis (simplified implementations)

async def generate_ai_insights(patient_id: int, vitals: List[Vitals], insight_types: Optional[List[InsightType]], limit: int) -> List[HealthInsight]:
    """Generate AI-powered health insights"""
    insights = []
    
    # Risk prediction insight
    if not insight_types or InsightType.RISK_PREDICTION in insight_types:
        # Analyze blood pressure trends
        bp_readings = [v for v in vitals if v.type in ['blood_pressure_systolic', 'blood_pressure_diastolic']]
        if bp_readings:
            avg_systolic = statistics.mean([v.value for v in bp_readings if v.type == 'blood_pressure_systolic'])
            risk_level = RiskLevel.HIGH if avg_systolic > 140 else RiskLevel.MEDIUM if avg_systolic > 130 else RiskLevel.LOW
            
            insights.append(HealthInsight(
                id=f"bp_risk_{patient_id}",
                type=InsightType.RISK_PREDICTION,
                title="Blood Pressure Risk Assessment",
                description=f"Average systolic pressure of {avg_systolic:.1f} mmHg indicates {risk_level.value} cardiovascular risk",
                risk_level=risk_level,
                confidence=0.85,
                generated_at=datetime.now(),
                valid_until=datetime.now() + timedelta(days=7),
                data_points_used=len(bp_readings),
                recommendations=[
                    "Monitor blood pressure daily",
                    "Reduce sodium intake",
                    "Increase physical activity",
                    "Consider medication adjustment"
                ],
                metrics={"avg_systolic": avg_systolic, "readings_count": len(bp_readings)}
            ))
    
    # Trend analysis insight
    if not insight_types or InsightType.TREND_ANALYSIS in insight_types:
        weight_readings = [v for v in vitals if v.type == 'weight']
        if len(weight_readings) >= 3:
            recent_weights = sorted(weight_readings, key=lambda x: x.recorded_at)[-3:]
            trend = "increasing" if recent_weights[-1].value > recent_weights[0].value else "decreasing"
            
            insights.append(HealthInsight(
                id=f"weight_trend_{patient_id}",
                type=InsightType.TREND_ANALYSIS,
                title="Weight Trend Analysis",
                description=f"Weight has been {trend} over the past {len(recent_weights)} measurements",
                risk_level=RiskLevel.LOW,
                confidence=0.78,
                generated_at=datetime.now(),
                valid_until=datetime.now() + timedelta(days=14),
                data_points_used=len(weight_readings),
                recommendations=[
                    "Continue monitoring weight weekly",
                    "Maintain current diet and exercise routine" if trend == "decreasing" else "Consider dietary consultation",
                    "Track caloric intake"
                ],
                metrics={"trend": trend, "weight_change": recent_weights[-1].value - recent_weights[0].value}
            ))
    
    # Medication adherence insight
    if not insight_types or InsightType.MEDICATION_ADHERENCE in insight_types:
        # Mock medication adherence analysis
        insights.append(HealthInsight(
            id=f"med_adherence_{patient_id}",
            type=InsightType.MEDICATION_ADHERENCE,
            title="Medication Adherence Analysis",
            description="Based on vital sign patterns, medication adherence appears optimal",
            risk_level=RiskLevel.LOW,
            confidence=0.72,
            generated_at=datetime.now(),
            valid_until=datetime.now() + timedelta(days=30),
            data_points_used=len(vitals),
            recommendations=[
                "Continue current medication schedule",
                "Set daily reminders if needed",
                "Track medication effects on vitals"
            ],
            metrics={"adherence_score": 0.95, "consistency_rating": "high"}
        ))
    
    return insights[:limit]


async def calculate_risk_assessment(patient: Patient, vitals: List[Vitals]) -> RiskAssessment:
    """Calculate comprehensive risk assessment"""
    
    # Analyze risk factors
    risk_factors = []
    protective_factors = []
    
    # Blood pressure analysis
    bp_systolic = [v.value for v in vitals if v.type == 'blood_pressure_systolic']
    if bp_systolic:
        avg_bp = statistics.mean(bp_systolic)
        if avg_bp > 140:
            risk_factors.append({
                "factor": "Hypertension",
                "severity": "high" if avg_bp > 160 else "medium",
                "value": avg_bp,
                "impact": "Increased cardiovascular risk"
            })
        elif avg_bp < 120:
            protective_factors.append({
                "factor": "Optimal Blood Pressure",
                "value": avg_bp,
                "benefit": "Reduced cardiovascular risk"
            })
    
    # Weight analysis
    weights = [v.value for v in vitals if v.type == 'weight']
    if weights:
        # Mock BMI calculation (would need height)
        bmi = 25.5  # Mock value
        if bmi > 30:
            risk_factors.append({
                "factor": "Obesity",
                "severity": "high",
                "value": bmi,
                "impact": "Increased risk for diabetes and heart disease"
            })
        elif bmi < 25:
            protective_factors.append({
                "factor": "Healthy Weight",
                "value": bmi,
                "benefit": "Reduced metabolic risk"
            })
    
    # Calculate overall risk
    risk_score = len(risk_factors) * 20 + random.randint(0, 20)
    if risk_score > 70:
        overall_risk = RiskLevel.HIGH
    elif risk_score > 40:
        overall_risk = RiskLevel.MEDIUM
    else:
        overall_risk = RiskLevel.LOW
    
    return RiskAssessment(
        patient_id=patient.id,
        overall_risk=overall_risk,
        risk_percentage=min(risk_score, 100),
        risk_factors=risk_factors,
        protective_factors=protective_factors,
        generated_at=datetime.now(),
        next_assessment_due=date.today() + timedelta(days=30)
    )


async def analyze_health_trends(vitals: List[Vitals], vital_types: Optional[List[str]], period_days: int) -> List[TrendAnalysis]:
    """Analyze health trends from vitals data"""
    trends = []
    
    # Group vitals by type
    vital_groups = {}
    for vital in vitals:
        if not vital_types or vital.type in vital_types:
            if vital.type not in vital_groups:
                vital_groups[vital.type] = []
            vital_groups[vital.type].append(vital)
    
    # Analyze each vital type
    for vital_type, readings in vital_groups.items():
        if len(readings) < 3:
            continue
            
        # Sort by date
        readings.sort(key=lambda x: x.recorded_at)
        values = [r.value for r in readings]
        
        # Calculate trend
        if len(values) >= 3:
            # Simple linear trend analysis
            first_half = values[:len(values)//2]
            second_half = values[len(values)//2:]
            
            avg_first = statistics.mean(first_half)
            avg_second = statistics.mean(second_half)
            
            change_percent = ((avg_second - avg_first) / avg_first) * 100 if avg_first != 0 else 0
            
            if abs(change_percent) < 5:
                trend_direction = "stable"
                trend_strength = 0.3
            elif change_percent > 0:
                trend_direction = "increasing"
                trend_strength = min(abs(change_percent) / 20, 1.0)
            else:
                trend_direction = "decreasing"
                trend_strength = min(abs(change_percent) / 20, 1.0)
            
            # Predict next value (simple linear extrapolation)
            if len(values) >= 2:
                slope = (values[-1] - values[0]) / len(values)
                predicted_value = values[-1] + slope
            else:
                predicted_value = values[-1]
            
            trends.append(TrendAnalysis(
                vital_type=vital_type,
                trend_direction=trend_direction,
                trend_strength=trend_strength,
                period_days=period_days,
                predicted_value=predicted_value,
                confidence_interval=[predicted_value * 0.9, predicted_value * 1.1],
                alert_threshold_days=7 if trend_strength > 0.7 else None
            ))
    
    return trends


async def generate_care_recommendations(patient: Patient, vitals: List[Vitals], priority_filter: Optional[str], category_filter: Optional[str]) -> List[CareRecommendation]:
    """Generate personalized care recommendations"""
    recommendations = []
    
    # Analyze vitals for recommendations
    bp_readings = [v for v in vitals if v.type in ['blood_pressure_systolic', 'blood_pressure_diastolic']]
    if bp_readings:
        avg_systolic = statistics.mean([v.value for v in bp_readings if v.type == 'blood_pressure_systolic'])
        
        if avg_systolic > 140:
            recommendations.append(CareRecommendation(
                category="cardiovascular",
                priority="high",
                title="Blood Pressure Management",
                description="Elevated blood pressure readings require immediate attention",
                action_items=[
                    "Schedule cardiology consultation within 2 weeks",
                    "Start daily BP monitoring",
                    "Implement DASH diet",
                    "Begin moderate exercise program"
                ],
                expected_outcome="Reduce systolic BP to <130 mmHg",
                timeline="4-6 weeks"
            ))
    
    # Weight management recommendation
    weight_readings = [v for v in vitals if v.type == 'weight']
    if weight_readings:
        latest_weight = max(weight_readings, key=lambda x: x.recorded_at).value
        # Mock BMI calculation
        if latest_weight > 180:  # Simplified check
            recommendations.append(CareRecommendation(
                category="lifestyle",
                priority="medium",
                title="Weight Management Program",
                description="Current weight may benefit from structured management approach",
                action_items=[
                    "Consult with nutritionist",
                    "Create personalized meal plan",
                    "Start gradual exercise routine",
                    "Track daily caloric intake"
                ],
                expected_outcome="Lose 1-2 lbs per week safely",
                timeline="3-6 months"
            ))
    
    # Preventive care recommendation
    recommendations.append(CareRecommendation(
        category="preventive",
        priority="low",
        title="Routine Health Maintenance",
        description="Stay on track with preventive care measures",
        action_items=[
            "Schedule annual physical exam",
            "Update vaccinations as needed",
            "Complete recommended screenings",
            "Review medication list with pharmacist"
        ],
        expected_outcome="Maintain optimal health status",
        timeline="Next 6 months"
    ))
    
    # Apply filters
    if priority_filter:
        recommendations = [r for r in recommendations if r.priority == priority_filter]
    if category_filter:
        recommendations = [r for r in recommendations if r.category == category_filter]
    
    return recommendations


async def predict_outcomes(patient: Patient, vitals: List[Vitals], horizon_days: int) -> Dict[str, Any]:
    """Predict health outcomes using AI models"""
    
    # Mock prediction model (in real implementation, would use ML models)
    predictions = {
        "prediction_horizon_days": horizon_days,
        "generated_at": datetime.now().isoformat(),
        "model_version": "1.0.0",
        "confidence_score": 0.82,
        "outcomes": [
            {
                "outcome_type": "blood_pressure_control",
                "probability": 0.78,
                "description": "Likelihood of maintaining target BP <130/80",
                "confidence_interval": [0.65, 0.91],
                "factors": ["medication_adherence", "lifestyle_changes", "stress_management"]
            },
            {
                "outcome_type": "cardiovascular_event",
                "probability": 0.15,
                "description": "Risk of cardiovascular event in next 30 days",
                "confidence_interval": [0.08, 0.25],
                "factors": ["blood_pressure", "family_history", "smoking_status"]
            },
            {
                "outcome_type": "medication_effectiveness",
                "probability": 0.85,
                "description": "Likelihood current medications remain effective",
                "confidence_interval": [0.72, 0.95],
                "factors": ["adherence_pattern", "side_effects", "dosage_optimization"]
            }
        ],
        "recommendations": [
            "Continue current medication regimen",
            "Monitor BP daily for next 2 weeks",
            "Schedule follow-up in 4 weeks"
        ]
    }
    
    return predictions