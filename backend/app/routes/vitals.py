"""
Vitals API Routes
Handles patient vital signs tracking and monitoring
"""

from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import and_, desc, select
from pydantic import BaseModel, Field
from datetime import datetime, timedelta
import logging

from ..database import get_db
from ..models.models import User, Patient, Vitals, VitalType
from ..routes.auth import get_current_user

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(tags=["vitals"])


class VitalCreate(BaseModel):
    type: str = Field(..., description="Type of vital sign")
    value: float = Field(..., description="Numeric value of the vital sign")
    unit: str = Field(..., description="Unit of measurement")
    recorded_at: datetime = Field(default_factory=datetime.now, description="When the vital was recorded")
    notes: Optional[str] = Field(None, description="Additional notes")
    status: str = Field(default="normal", description="Status: normal, warning, critical")


class VitalResponse(BaseModel):
    id: int
    type: str
    value: float
    unit: str
    recorded_at: datetime
    notes: Optional[str]
    status: str
    
    class Config:
        from_attributes = True


@router.post("/", response_model=dict)
async def create_vital(
    vital_data: VitalCreate,
    db: AsyncSession = Depends(get_db)
) -> dict:
    """Record a new vital sign reading"""
    try:
        logger.info(f"📊 Recording vital sign")
        
        # For now, use a default patient ID (1) to bypass authentication
        patient_id = 1
        
        # Validate vital type
        valid_types = [vt.value for vt in VitalType]
        if vital_data.type not in valid_types:
            return {
                "success": False,
                "message": f"Invalid vital type. Valid types: {', '.join(valid_types)}"
            }
        
        # Validate status
        valid_statuses = ["normal", "warning", "critical"]
        if vital_data.status not in valid_statuses:
            return {
                "success": False,
                "message": f"Invalid status. Valid statuses: {', '.join(valid_statuses)}"
            }
        
        # Create vital record
        vital = Vitals(
            patient_id=patient_id,
            type=vital_data.type,
            value=vital_data.value,
            unit=vital_data.unit,
            recorded_at=vital_data.recorded_at,
            notes=vital_data.notes,
            status=vital_data.status
        )
        
        db.add(vital)
        await db.commit()
        await db.refresh(vital)
        
        logger.info(f"✅ Vital sign recorded with ID: {vital.id}")
        
        return {
            "success": True,
            "message": "Vital sign recorded successfully",
            "data": {
                "id": vital.id,
                "type": vital.type,
                "value": vital.value,
                "unit": vital.unit,
                "recorded_at": vital.recorded_at.isoformat(),
                "notes": vital.notes,
                "status": vital.status
            }
        }
        
    except Exception as e:
        logger.error(f"❌ Error recording vital sign: {e}")
        return {
            "success": False,
            "message": f"Failed to record vital sign: {str(e)}"
        }


@router.get("/", response_model=dict)
async def get_vitals(
    vital_type: Optional[str] = None,
    days: int = 30,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
) -> dict:
    """Get patient's vital signs with optional filtering"""
    try:
        # For now, use default patient ID (1) to bypass authentication
        patient_id = 1
        
        # Build query
        query = select(Vitals).filter(Vitals.patient_id == patient_id)
        
        # Filter by vital type if specified
        if vital_type:
            valid_types = [vt.value for vt in VitalType]
            if vital_type not in valid_types:
                return {
                    "success": False,
                    "message": f"Invalid vital type. Valid types: {', '.join(valid_types)}"
                }
            query = query.filter(Vitals.type == vital_type)
        
        # Filter by date range
        if days > 0:
            start_date = datetime.now() - timedelta(days=days)
            query = query.filter(Vitals.recorded_at >= start_date)
        
        # Order by most recent first
        query = query.order_by(desc(Vitals.recorded_at))
        
        # Apply pagination
        query = query.offset(skip).limit(limit)
        
        # Execute query
        vitals_result = await db.execute(query)
        vitals = vitals_result.scalars().all()
        
        return {
            "success": True,
            "data": [
                {
                    "id": vital.id,
                    "type": vital.type,
                    "value": vital.value,
                    "unit": vital.unit,
                    "recorded_at": vital.recorded_at.isoformat(),
                    "notes": vital.notes,
                    "status": vital.status
                }
                for vital in vitals
            ]
        }
        
    except Exception as e:
        logger.error(f"❌ Error fetching vitals: {e}")
        return {
            "success": False,
            "message": f"Failed to fetch vitals: {str(e)}"
        }


@router.get("/types/")
async def get_vital_types() -> List[str]:
    """Get list of available vital sign types"""
    return [vt.value for vt in VitalType]