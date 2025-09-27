"""
Appointment Scheduling API Routes
Handles appointment booking, calendar management, and clinic availability
"""

from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, and_, or_, func
from pydantic import BaseModel, Field
from datetime import datetime, date, time, timedelta
from enum import Enum
import logging

from ..database import get_db
from ..models.models import User, Patient
from ..routes.auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(tags=["appointments"])


class AppointmentStatus(str, Enum):
    SCHEDULED = "scheduled"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"
    NO_SHOW = "no_show"


class AppointmentType(str, Enum):
    CONSULTATION = "consultation"
    FOLLOW_UP = "follow_up"
    CHECKUP = "checkup"
    EMERGENCY = "emergency"
    TELEHEALTH = "telehealth"
    PROCEDURE = "procedure"


class TimeSlot(BaseModel):
    start_time: datetime
    end_time: datetime
    available: bool
    provider_id: Optional[int] = None
    provider_name: Optional[str] = None


class AppointmentCreate(BaseModel):
    provider_id: int
    appointment_date: date
    start_time: time
    appointment_type: AppointmentType
    notes: Optional[str] = None
    is_telehealth: bool = False


class AppointmentResponse(BaseModel):
    id: int
    patient_id: int
    provider_id: int
    provider_name: str
    appointment_date: date
    start_time: time
    end_time: time
    appointment_type: str
    status: str
    notes: Optional[str]
    is_telehealth: bool
    telehealth_link: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class AppointmentUpdate(BaseModel):
    appointment_date: Optional[date] = None
    start_time: Optional[time] = None
    appointment_type: Optional[AppointmentType] = None
    notes: Optional[str] = None
    status: Optional[AppointmentStatus] = None


class ProviderAvailability(BaseModel):
    provider_id: int
    provider_name: str
    specialization: str
    available_slots: List[TimeSlot]
    next_available: Optional[datetime]


# Mock data for providers (would come from database in real implementation)
MOCK_PROVIDERS = [
    {"id": 1, "name": "Dr. Sarah Johnson", "specialization": "Cardiology"},
    {"id": 2, "name": "Dr. Michael Chen", "specialization": "Internal Medicine"},
    {"id": 3, "name": "Dr. Emily Rodriguez", "specialization": "Endocrinology"},
    {"id": 4, "name": "Dr. David Kim", "specialization": "Pulmonology"},
    {"id": 5, "name": "Dr. Lisa Thompson", "specialization": "Nephrology"}
]


@router.get("/providers")
async def get_available_providers(
    specialization: Optional[str] = Query(None, description="Filter by specialization"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> List[Dict[str, Any]]:
    """Get list of available healthcare providers"""
    try:
        providers = MOCK_PROVIDERS
        
        if specialization:
            providers = [p for p in providers if specialization.lower() in p["specialization"].lower()]
        
        return providers
        
    except Exception as e:
        logger.error(f"❌ Error fetching providers: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch providers: {str(e)}")


@router.get("/availability/{provider_id}")
async def get_provider_availability(
    provider_id: int,
    start_date: date = Query(..., description="Start date for availability check"),
    days: int = Query(7, description="Number of days to check", le=30),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> ProviderAvailability:
    """Get availability for a specific provider"""
    try:
        # Find provider
        provider = next((p for p in MOCK_PROVIDERS if p["id"] == provider_id), None)
        if not provider:
            raise HTTPException(status_code=404, detail="Provider not found")
        
        # Generate mock availability slots
        available_slots = []
        current_date = start_date
        
        for day in range(days):
            # Skip weekends for this example
            if current_date.weekday() < 5:  # Monday = 0, Friday = 4
                # Morning slots: 9 AM - 12 PM
                for hour in range(9, 12):
                    slot_start = datetime.combine(current_date, time(hour, 0))
                    slot_end = datetime.combine(current_date, time(hour + 1, 0))
                    
                    # Mock some slots as taken
                    is_available = not (hour == 10 and day % 3 == 0)  # Some random unavailability
                    
                    available_slots.append(TimeSlot(
                        start_time=slot_start,
                        end_time=slot_end,
                        available=is_available,
                        provider_id=provider_id,
                        provider_name=provider["name"]
                    ))
                
                # Afternoon slots: 2 PM - 5 PM
                for hour in range(14, 17):
                    slot_start = datetime.combine(current_date, time(hour, 0))
                    slot_end = datetime.combine(current_date, time(hour + 1, 0))
                    
                    # Mock some slots as taken
                    is_available = not (hour == 15 and day % 2 == 0)
                    
                    available_slots.append(TimeSlot(
                        start_time=slot_start,
                        end_time=slot_end,
                        available=is_available,
                        provider_id=provider_id,
                        provider_name=provider["name"]
                    ))
            
            current_date += timedelta(days=1)
        
        # Find next available slot
        next_available = None
        for slot in available_slots:
            if slot.available and slot.start_time > datetime.now():
                next_available = slot.start_time
                break
        
        return ProviderAvailability(
            provider_id=provider_id,
            provider_name=provider["name"],
            specialization=provider["specialization"],
            available_slots=available_slots,
            next_available=next_available
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error fetching availability: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch availability: {str(e)}")


@router.post("/", response_model=dict)
async def create_appointment(
    appointment_data: AppointmentCreate,
    db: AsyncSession = Depends(get_db)
) -> dict:
    """Create a new appointment"""
    try:
        # Use default patient ID (1) to bypass authentication
        patient_id = 1
        
        # Validate provider exists
        provider = next((p for p in MOCK_PROVIDERS if p["id"] == appointment_data.provider_id), None)
        if not provider:
            return {
                "success": False,
                "message": "Provider not found"
            }
        
        # Check if the requested slot is available
        appointment_datetime = datetime.combine(appointment_data.appointment_date, appointment_data.start_time)
        
        # Basic validation: not in the past
        if appointment_datetime <= datetime.now():
            return {
                "success": False,
                "message": "Cannot schedule appointments in the past"
            }
        
        # Business hours validation (9 AM - 5 PM, weekdays only)
        if appointment_data.start_time.hour < 9 or appointment_data.start_time.hour >= 17:
            return {
                "success": False,
                "message": "Appointments must be between 9 AM and 5 PM"
            }
        
        if appointment_data.appointment_date.weekday() >= 5:  # Saturday = 5, Sunday = 6
            return {
                "success": False,
                "message": "Appointments not available on weekends"
            }
        
        # Calculate end time (1 hour appointments)
        end_time = time(appointment_data.start_time.hour + 1, 0)
        
        # Generate telehealth link if needed
        telehealth_link = None
        if appointment_data.is_telehealth:
            telehealth_link = f"https://meet.medintel.com/room/{patient_id}-{appointment_data.provider_id}-{appointment_datetime.strftime('%Y%m%d%H%M')}"
        
        # Mock appointment creation (would save to database in real implementation)
        appointment_id = hash(f"{patient_id}-{appointment_data.provider_id}-{appointment_datetime}") % 10000
        
        appointment_data_response = {
            "id": appointment_id,
            "patient_id": patient_id,
            "provider_id": appointment_data.provider_id,
            "provider_name": provider["name"],
            "appointment_date": appointment_data.appointment_date.isoformat(),
            "start_time": appointment_data.start_time.isoformat(),
            "end_time": end_time.isoformat(),
            "appointment_type": appointment_data.appointment_type.value,
            "status": AppointmentStatus.SCHEDULED.value,
            "notes": appointment_data.notes,
            "is_telehealth": appointment_data.is_telehealth,
            "telehealth_link": telehealth_link,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        logger.info(f"✅ Appointment created: {appointment_id} for patient {patient_id}")
        
        return {
            "success": True,
            "message": "Appointment created successfully",
            "data": appointment_data_response
        }
        
    except Exception as e:
        logger.error(f"❌ Error creating appointment: {e}")
        return {
            "success": False,
            "message": f"Failed to create appointment: {str(e)}"
        }


@router.get("/", response_model=dict)
async def get_patient_appointments(
    status: Optional[AppointmentStatus] = Query(None, description="Filter by appointment status"),
    start_date: Optional[date] = Query(None, description="Filter appointments from this date"),
    end_date: Optional[date] = Query(None, description="Filter appointments until this date"),
    limit: int = Query(20, description="Maximum number of appointments to return"),
    db: AsyncSession = Depends(get_db)
) -> dict:
    """Get patient's appointments with optional filtering"""
    try:
        # Use mock patient ID (bypass authentication)
        patient_id = 1
        
        # Mock appointments data (would query database in real implementation)
        mock_appointments = [
            {
                "id": 1001,
                "patient_id": patient_id,
                "provider_id": 1,
                "provider_name": "Dr. Sarah Johnson",
                "appointment_date": "2025-01-15",
                "start_time": "09:00:00",
                "end_time": "09:30:00",
                "appointment_type": "consultation",
                "status": "scheduled",
                "notes": "Initial consultation",
                "is_telehealth": False,
                "telehealth_link": None,
                "created_at": "2025-01-14T10:00:00",
                "updated_at": "2025-01-14T10:00:00"
            },
            {
                "id": 1002,
                "patient_id": patient_id,
                "provider_id": 2,
                "provider_name": "Dr. Michael Chen",
                "appointment_date": "2025-01-22",
                "start_time": "14:00:00",
                "end_time": "14:30:00",
                "appointment_type": "follow_up",
                "status": "confirmed",
                "notes": "Follow-up appointment",
                "is_telehealth": True,
                "telehealth_link": "https://meet.example.com/appointment-1002",
                "created_at": "2025-01-14T11:00:00",
                "updated_at": "2025-01-14T11:00:00"
            }
        ]
        
        # Apply filters
        filtered_appointments = mock_appointments
        
        if status:
            filtered_appointments = [apt for apt in filtered_appointments if apt["status"] == status]
        
        # Apply limit
        filtered_appointments = filtered_appointments[:limit]
        
        logger.info(f"✅ Retrieved {len(filtered_appointments)} appointments for patient {patient_id}")
        
        return {
            "success": True,
            "message": f"Retrieved {len(filtered_appointments)} appointments",
            "data": filtered_appointments
        }
        
    except Exception as e:
        logger.error(f"❌ Error retrieving appointments: {e}")
        return {
            "success": False,
            "message": f"Failed to retrieve appointments: {str(e)}"
        }


@router.get("/{appointment_id}", response_model=AppointmentResponse)
async def get_appointment(
    appointment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> AppointmentResponse:
    """Get specific appointment details"""
    try:
        # Mock appointment lookup (would query database in real implementation)
        mock_appointment = AppointmentResponse(
            id=appointment_id,
            patient_id=1,
            provider_id=1,
            provider_name="Dr. Sarah Johnson",
            appointment_date=date.today() + timedelta(days=7),
            start_time=time(10, 0),
            end_time=time(11, 0),
            appointment_type="consultation",
            status="scheduled",
            notes="Regular checkup",
            is_telehealth=False,
            telehealth_link=None,
            created_at=datetime.now() - timedelta(days=1),
            updated_at=datetime.now() - timedelta(days=1)
        )
        
        return mock_appointment
        
    except Exception as e:
        logger.error(f"❌ Error fetching appointment {appointment_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch appointment: {str(e)}")


@router.put("/{appointment_id}", response_model=AppointmentResponse)
async def update_appointment(
    appointment_id: int,
    update_data: AppointmentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> AppointmentResponse:
    """Update appointment details"""
    try:
        # Mock appointment update (would update database in real implementation)
        updated_appointment = AppointmentResponse(
            id=appointment_id,
            patient_id=1,
            provider_id=1,
            provider_name="Dr. Sarah Johnson",
            appointment_date=update_data.appointment_date or (date.today() + timedelta(days=7)),
            start_time=update_data.start_time or time(10, 0),
            end_time=time(11, 0),
            appointment_type=update_data.appointment_type.value if update_data.appointment_type else "consultation",
            status=update_data.status.value if update_data.status else "scheduled",
            notes=update_data.notes or "Regular checkup",
            is_telehealth=False,
            telehealth_link=None,
            created_at=datetime.now() - timedelta(days=1),
            updated_at=datetime.now()
        )
        
        logger.info(f"✅ Appointment {appointment_id} updated successfully")
        
        return updated_appointment
        
    except Exception as e:
        logger.error(f"❌ Error updating appointment {appointment_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update appointment: {str(e)}")


@router.delete("/{appointment_id}")
async def cancel_appointment(
    appointment_id: int,
    reason: Optional[str] = Query(None, description="Reason for cancellation"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, str]:
    """Cancel an appointment"""
    try:
        # Mock appointment cancellation (would update database in real implementation)
        logger.info(f"✅ Appointment {appointment_id} cancelled. Reason: {reason or 'Not specified'}")
        
        return {
            "message": "Appointment cancelled successfully",
            "appointment_id": str(appointment_id),
            "reason": reason or "Not specified"
        }
        
    except Exception as e:
        logger.error(f"❌ Error cancelling appointment {appointment_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to cancel appointment: {str(e)}")


@router.get("/upcoming/count")
async def get_upcoming_appointments_count(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, int]:
    """Get count of upcoming appointments"""
    try:
        # Mock count (would query database in real implementation)
        return {
            "total_upcoming": 2,
            "this_week": 1,
            "this_month": 2,
            "telehealth": 1
        }
        
    except Exception as e:
        logger.error(f"❌ Error counting appointments: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to count appointments: {str(e)}")