"""
Care Plan Management API Routes
Handles patient care plans, treatment tracking, and medication management
"""

from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, and_
from pydantic import BaseModel, Field
from datetime import datetime, date, time, timedelta
from enum import Enum
import logging

from ..database import get_db
from ..models.models import User, Patient
from ..routes.auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(tags=["care_plans"])


class CarePlanStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    PAUSED = "paused"
    CANCELLED = "cancelled"


class GoalStatus(str, Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    OVERDUE = "overdue"


class MedicationFrequency(str, Enum):
    DAILY = "daily"
    TWICE_DAILY = "twice_daily"
    THREE_TIMES_DAILY = "three_times_daily"
    WEEKLY = "weekly"
    AS_NEEDED = "as_needed"


class CarePlanCreate(BaseModel):
    title: str = Field(..., description="Care plan title")
    description: str = Field(..., description="Detailed description of the care plan")
    start_date: date
    target_end_date: Optional[date] = None
    priority: str = Field(default="medium", description="Priority: low, medium, high")
    assigned_provider_id: Optional[int] = None
    goals: List[str] = Field(default=[], description="List of care goals")
    medications: List[Dict[str, Any]] = Field(default=[], description="Medication schedule")


class CarePlanGoal(BaseModel):
    id: int
    care_plan_id: int
    title: str
    description: str
    target_date: Optional[date]
    status: str
    progress_percentage: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class MedicationSchedule(BaseModel):
    id: int
    care_plan_id: int
    medication_name: str
    dosage: str
    frequency: str
    instructions: Optional[str]
    start_date: date
    end_date: Optional[date]
    is_active: bool
    reminder_times: List[str]  # Times for daily reminders
    created_at: datetime
    
    class Config:
        from_attributes = True


class CarePlanResponse(BaseModel):
    id: int
    patient_id: int
    title: str
    description: str
    start_date: date
    target_end_date: Optional[date]
    status: str
    priority: str
    assigned_provider_id: Optional[int]
    assigned_provider_name: Optional[str]
    progress_percentage: int
    goals: List[CarePlanGoal]
    medications: List[MedicationSchedule]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class CarePlanUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    target_end_date: Optional[date] = None
    status: Optional[CarePlanStatus] = None
    priority: Optional[str] = None


class GoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    target_date: Optional[date] = None
    status: Optional[GoalStatus] = None
    progress_percentage: Optional[int] = Field(None, ge=0, le=100)


class MedicationReminder(BaseModel):
    id: int
    medication_name: str
    dosage: str
    scheduled_time: datetime
    status: str  # "pending", "taken", "missed", "skipped"
    notes: Optional[str]


class CarePlanStats(BaseModel):
    total_goals: int
    completed_goals: int
    progress_percentage: int
    active_medications: int
    upcoming_reminders: int
    overdue_goals: int
    days_since_start: int
    estimated_days_remaining: Optional[int]


# Mock data for providers
MOCK_PROVIDERS = {
    1: "Dr. Sarah Johnson",
    2: "Dr. Michael Chen", 
    3: "Dr. Emily Rodriguez"
}


@router.post("/", response_model=CarePlanResponse)
async def create_care_plan(
    care_plan_data: CarePlanCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> CarePlanResponse:
    """Create a new care plan for the patient"""
    try:
        # Get patient record
        patient_result = await db.execute(
            select(Patient).filter(Patient.user_id == current_user.id)
        )
        patient = patient_result.scalar_one_or_none()
        
        if not patient:
            raise HTTPException(status_code=404, detail="Patient profile not found")
        
        # Generate mock care plan ID
        care_plan_id = hash(f"{patient.id}-{care_plan_data.title}-{datetime.now()}") % 10000
        
        # Create goals from the provided list
        goals = []
        for i, goal_title in enumerate(care_plan_data.goals):
            goals.append(CarePlanGoal(
                id=care_plan_id * 100 + i,
                care_plan_id=care_plan_id,
                title=goal_title,
                description=f"Goal: {goal_title}",
                target_date=care_plan_data.target_end_date,
                status=GoalStatus.NOT_STARTED.value,
                progress_percentage=0,
                created_at=datetime.now(),
                updated_at=datetime.now()
            ))
        
        # Create medication schedules
        medications = []
        for i, med_data in enumerate(care_plan_data.medications):
            medications.append(MedicationSchedule(
                id=care_plan_id * 1000 + i,
                care_plan_id=care_plan_id,
                medication_name=med_data.get("name", "Unknown Medication"),
                dosage=med_data.get("dosage", "As prescribed"),
                frequency=med_data.get("frequency", "daily"),
                instructions=med_data.get("instructions"),
                start_date=care_plan_data.start_date,
                end_date=care_plan_data.target_end_date,
                is_active=True,
                reminder_times=med_data.get("reminder_times", ["08:00", "20:00"]),
                created_at=datetime.now()
            ))
        
        care_plan = CarePlanResponse(
            id=care_plan_id,
            patient_id=patient.id,
            title=care_plan_data.title,
            description=care_plan_data.description,
            start_date=care_plan_data.start_date,
            target_end_date=care_plan_data.target_end_date,
            status=CarePlanStatus.ACTIVE.value,
            priority=care_plan_data.priority,
            assigned_provider_id=care_plan_data.assigned_provider_id,
            assigned_provider_name=MOCK_PROVIDERS.get(care_plan_data.assigned_provider_id) if care_plan_data.assigned_provider_id else None,
            progress_percentage=0,
            goals=goals,
            medications=medications,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        logger.info(f"✅ Care plan created: {care_plan_id} for patient {patient.id}")
        
        return care_plan
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error creating care plan: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create care plan: {str(e)}")


@router.get("/", response_model=List[CarePlanResponse])
async def get_care_plans(
    status: Optional[CarePlanStatus] = Query(None, description="Filter by status"),
    active_only: bool = Query(True, description="Show only active care plans"),
    db: AsyncSession = Depends(get_db)
) -> List[CarePlanResponse]:
    """Get patient's care plans"""
    try:
        # Use patient ID 1 for testing
        patient_id = 1
        
        # Get patient record
        patient_result = await db.execute(
            select(Patient).filter(Patient.id == patient_id)
        )
        patient = patient_result.scalar_one_or_none()
        
        if not patient:
            raise HTTPException(status_code=404, detail="Patient profile not found")
        
        # Mock care plans data
        mock_care_plans = [
            CarePlanResponse(
                id=1001,
                patient_id=patient.id,
                title="Diabetes Management Plan",
                description="Comprehensive diabetes care including blood sugar monitoring, medication adherence, and lifestyle modifications.",
                start_date=date.today() - timedelta(days=30),
                target_end_date=date.today() + timedelta(days=90),
                status=CarePlanStatus.ACTIVE.value,
                priority="high",
                assigned_provider_id=2,
                assigned_provider_name="Dr. Michael Chen",
                progress_percentage=65,
                goals=[
                    CarePlanGoal(
                        id=1001001,
                        care_plan_id=1001,
                        title="Maintain HbA1c below 7%",
                        description="Monitor blood glucose regularly and maintain HbA1c levels below 7%",
                        target_date=date.today() + timedelta(days=90),
                        status=GoalStatus.IN_PROGRESS.value,
                        progress_percentage=70,
                        created_at=datetime.now() - timedelta(days=30),
                        updated_at=datetime.now() - timedelta(days=5)
                    ),
                    CarePlanGoal(
                        id=1001002,
                        care_plan_id=1001,
                        title="Daily exercise for 30 minutes",
                        description="Engage in moderate physical activity for at least 30 minutes daily",
                        target_date=date.today() + timedelta(days=90),
                        status=GoalStatus.IN_PROGRESS.value,
                        progress_percentage=60,
                        created_at=datetime.now() - timedelta(days=30),
                        updated_at=datetime.now() - timedelta(days=2)
                    )
                ],
                medications=[
                    MedicationSchedule(
                        id=1001101,
                        care_plan_id=1001,
                        medication_name="Metformin",
                        dosage="500mg",
                        frequency="twice_daily",
                        instructions="Take with meals",
                        start_date=date.today() - timedelta(days=30),
                        end_date=None,
                        is_active=True,
                        reminder_times=["08:00", "20:00"],
                        created_at=datetime.now() - timedelta(days=30)
                    )
                ],
                created_at=datetime.now() - timedelta(days=30),
                updated_at=datetime.now() - timedelta(days=5)
            ),
            CarePlanResponse(
                id=1002,
                patient_id=patient.id,
                title="Hypertension Control",
                description="Blood pressure management with medication and lifestyle changes.",
                start_date=date.today() - timedelta(days=60),
                target_end_date=date.today() + timedelta(days=60),
                status=CarePlanStatus.ACTIVE.value,
                priority="medium",
                assigned_provider_id=1,
                assigned_provider_name="Dr. Sarah Johnson",
                progress_percentage=80,
                goals=[
                    CarePlanGoal(
                        id=1002001,
                        care_plan_id=1002,
                        title="Maintain BP below 130/80",
                        description="Keep blood pressure readings consistently below 130/80 mmHg",
                        target_date=date.today() + timedelta(days=60),
                        status=GoalStatus.IN_PROGRESS.value,
                        progress_percentage=85,
                        created_at=datetime.now() - timedelta(days=60),
                        updated_at=datetime.now() - timedelta(days=3)
                    )
                ],
                medications=[
                    MedicationSchedule(
                        id=1002101,
                        care_plan_id=1002,
                        medication_name="Lisinopril",
                        dosage="10mg",
                        frequency="daily",
                        instructions="Take in the morning",
                        start_date=date.today() - timedelta(days=60),
                        end_date=None,
                        is_active=True,
                        reminder_times=["08:00"],
                        created_at=datetime.now() - timedelta(days=60)
                    )
                ],
                created_at=datetime.now() - timedelta(days=60),
                updated_at=datetime.now() - timedelta(days=3)
            )
        ]
        
        # Apply filters
        filtered_plans = mock_care_plans
        
        if status:
            filtered_plans = [plan for plan in filtered_plans if plan.status == status.value]
        
        if active_only:
            filtered_plans = [plan for plan in filtered_plans if plan.status == CarePlanStatus.ACTIVE.value]
        
        return filtered_plans
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error fetching care plans: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch care plans: {str(e)}")


@router.get("/{care_plan_id}", response_model=CarePlanResponse)
async def get_care_plan(
    care_plan_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> CarePlanResponse:
    """Get specific care plan details"""
    try:
        # Mock specific care plan (would query database in real implementation)
        mock_care_plan = CarePlanResponse(
            id=care_plan_id,
            patient_id=1,
            title="Diabetes Management Plan",
            description="Comprehensive diabetes care including blood sugar monitoring, medication adherence, and lifestyle modifications.",
            start_date=date.today() - timedelta(days=30),
            target_end_date=date.today() + timedelta(days=90),
            status=CarePlanStatus.ACTIVE.value,
            priority="high",
            assigned_provider_id=2,
            assigned_provider_name="Dr. Michael Chen",
            progress_percentage=65,
            goals=[],
            medications=[],
            created_at=datetime.now() - timedelta(days=30),
            updated_at=datetime.now() - timedelta(days=5)
        )
        
        return mock_care_plan
        
    except Exception as e:
        logger.error(f"❌ Error fetching care plan {care_plan_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch care plan: {str(e)}")


@router.get("/{care_plan_id}/stats", response_model=CarePlanStats)
async def get_care_plan_stats(
    care_plan_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> CarePlanStats:
    """Get care plan statistics and progress"""
    try:
        # Mock statistics calculation
        stats = CarePlanStats(
            total_goals=5,
            completed_goals=2,
            progress_percentage=65,
            active_medications=2,
            upcoming_reminders=4,
            overdue_goals=0,
            days_since_start=30,
            estimated_days_remaining=90
        )
        
        return stats
        
    except Exception as e:
        logger.error(f"❌ Error fetching care plan stats: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch stats: {str(e)}")


@router.get("/{care_plan_id}/reminders/today", response_model=List[MedicationReminder])
async def get_todays_medication_reminders(
    care_plan_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> List[MedicationReminder]:
    """Get today's medication reminders for a care plan"""
    try:
        # Mock today's reminders
        today = date.today()
        reminders = [
            MedicationReminder(
                id=1,
                medication_name="Metformin",
                dosage="500mg",
                scheduled_time=datetime.combine(today, time(8, 0)),
                status="taken",
                notes="Taken with breakfast"
            ),
            MedicationReminder(
                id=2,
                medication_name="Metformin",
                dosage="500mg",
                scheduled_time=datetime.combine(today, time(20, 0)),
                status="pending",
                notes=None
            ),
            MedicationReminder(
                id=3,
                medication_name="Lisinopril",
                dosage="10mg",
                scheduled_time=datetime.combine(today, time(8, 0)),
                status="taken",
                notes="Morning dose"
            )
        ]
        
        return reminders
        
    except Exception as e:
        logger.error(f"❌ Error fetching reminders: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch reminders: {str(e)}")


@router.put("/{care_plan_id}/goals/{goal_id}")
async def update_goal_progress(
    care_plan_id: int,
    goal_id: int,
    goal_update: GoalUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, str]:
    """Update progress on a specific care plan goal"""
    try:
        # Mock goal update (would update database in real implementation)
        logger.info(f"✅ Goal {goal_id} updated for care plan {care_plan_id}")
        
        return {
            "message": "Goal updated successfully",
            "care_plan_id": str(care_plan_id),
            "goal_id": str(goal_id)
        }
        
    except Exception as e:
        logger.error(f"❌ Error updating goal: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update goal: {str(e)}")


@router.post("/{care_plan_id}/reminders/{reminder_id}/complete")
async def mark_medication_taken(
    care_plan_id: int,
    reminder_id: int,
    notes: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, str]:
    """Mark a medication reminder as completed"""
    try:
        # Mock reminder completion (would update database in real implementation)
        logger.info(f"✅ Medication reminder {reminder_id} marked as taken")
        
        return {
            "message": "Medication marked as taken",
            "reminder_id": str(reminder_id),
            "notes": notes or ""
        }
        
    except Exception as e:
        logger.error(f"❌ Error marking medication taken: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to mark medication: {str(e)}")