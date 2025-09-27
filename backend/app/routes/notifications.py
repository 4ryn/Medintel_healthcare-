from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, func
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta
from enum import Enum
import json

from app.database import get_db
from app.routes.auth import get_current_active_user
from app.models.models import User, Notification, Patient, Appointment

router = APIRouter()


class NotificationType(str, Enum):
    MEDICATION = "medication"
    APPOINTMENT = "appointment" 
    HEALTH_ALERT = "health_alert"
    SYSTEM = "system"
    REMINDER = "reminder"


class NotificationPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class NotificationResponse(BaseModel):
    id: int
    type: str
    title: str
    message: str
    priority: str
    read: bool
    created_at: datetime
    scheduled_for: Optional[datetime]
    action_required: bool
    metadata: Optional[dict]
    
    class Config:
        from_attributes = True


class NotificationCreate(BaseModel):
    type: NotificationType
    title: str
    message: str
    priority: NotificationPriority
    scheduled_for: Optional[datetime] = None
    action_required: bool = False
    metadata: Optional[dict] = None


class NotificationSettingsResponse(BaseModel):
    push_notifications: bool
    email_notifications: bool
    sms_notifications: bool
    medication_reminders: bool
    appointment_reminders: bool
    health_alerts: bool
    system_updates: bool
    reminder_frequency: str
    quiet_hours_enabled: bool
    quiet_hours_start: str
    quiet_hours_end: str


@router.get("/", response_model=List[NotificationResponse])
async def get_notifications(
    unread_only: bool = False,
    notification_type: Optional[str] = None,
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    """Get notifications for user ID 1"""
    # Use user ID 1 for testing
    user_id = 1
    query = select(Notification).filter(Notification.user_id == user_id)
    
    if unread_only:
        query = query.filter(Notification.read == False)
    
    if notification_type:
        query = query.filter(Notification.notification_type == notification_type)
    
    query = query.order_by(Notification.sent_at.desc()).limit(limit)
    
    result = await db.execute(query)
    notifications = result.scalars().all()
    
    # Convert to response format
    response_notifications = []
    for notification in notifications:
        response_notifications.append(NotificationResponse(
            id=notification.id,
            type=notification.notification_type,
            title=notification.title,
            message=notification.message,
            priority=notification.priority,
            read=notification.read,
            created_at=notification.sent_at,
            scheduled_for=None,  # Add to model if needed
            action_required=notification.priority in ["high", "urgent"],
            metadata=json.loads(notification.message) if notification.message.startswith('{') else {}
        ))
    
    return response_notifications


@router.post("/", response_model=NotificationResponse)
async def create_notification(
    notification: NotificationCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new notification"""
    from app.models.models import Notification
    
    db_notification = Notification(
        user_id=current_user.id,
        title=notification.title,
        message=notification.message,
        notification_type=notification.type.value,
        priority=notification.priority.value,
        read=False,
        sent_at=datetime.utcnow()
    )
    
    db.add(db_notification)
    await db.commit()
    await db.refresh(db_notification)
    
    return NotificationResponse(
        id=db_notification.id,
        type=db_notification.notification_type,
        title=db_notification.title,
        message=db_notification.message,
        priority=db_notification.priority,
        read=db_notification.read,
        created_at=db_notification.sent_at,
        scheduled_for=notification.scheduled_for,
        action_required=notification.action_required,
        metadata=notification.metadata
    )


@router.post("/{notification_id}/read")
async def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Mark a notification as read"""
    # Check if notification belongs to current user
    result = await db.execute(
        select(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == current_user.id
        )
    )
    notification = result.scalar_one_or_none()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    # Mark as read
    await db.execute(
        update(Notification)
        .where(Notification.id == notification_id)
        .values(read=True)
    )
    await db.commit()
    
    return {"message": "Notification marked as read"}


@router.post("/mark-all-read")
async def mark_all_notifications_read(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Mark all notifications as read for the current user"""
    await db.execute(
        update(Notification)
        .where(Notification.user_id == current_user.id)
        .values(read=True)
    )
    await db.commit()
    
    return {"message": "All notifications marked as read"}


@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a notification"""
    # Check if notification belongs to current user
    result = await db.execute(
        select(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == current_user.id
        )
    )
    notification = result.scalar_one_or_none()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    await db.delete(notification)
    await db.commit()
    
    return {"message": "Notification deleted"}


@router.get("/stats")
async def get_notification_stats(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get notification statistics for the current user"""
    # Total notifications
    total_result = await db.execute(
        select(func.count(Notification.id)).filter(Notification.user_id == current_user.id)
    )
    total_notifications = total_result.scalar()
    
    # Unread notifications
    unread_result = await db.execute(
        select(func.count(Notification.id)).filter(
            Notification.user_id == current_user.id,
            Notification.read == False
        )
    )
    unread_notifications = unread_result.scalar()
    
    # Action required (high/urgent priority unread)
    action_result = await db.execute(
        select(func.count(Notification.id)).filter(
            Notification.user_id == current_user.id,
            Notification.priority.in_(["high", "urgent"]),
            Notification.read == False
        )
    )
    action_required = action_result.scalar()
    
    # Today's reminders (medication/reminder type)
    today = datetime.utcnow().date()
    reminder_result = await db.execute(
        select(func.count(Notification.id)).filter(
            Notification.user_id == current_user.id,
            Notification.notification_type.in_(["medication", "reminder"]),
            func.date(Notification.sent_at) == today
        )
    )
    todays_reminders = reminder_result.scalar()
    
    return {
        "total_notifications": total_notifications,
        "unread_notifications": unread_notifications,
        "action_required": action_required,
        "todays_reminders": todays_reminders
    }


@router.post("/medication-reminder")
async def create_medication_reminder(
    medication_name: str,
    dosage: str,
    instructions: str,
    background_tasks: BackgroundTasks,
    reminder_time: Optional[datetime] = None,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a medication reminder notification"""
    from app.models.models import Notification
    
    notification = Notification(
        user_id=current_user.id,
        title="Medication Reminder",
        message=f"Time to take your {medication_name} ({dosage}). {instructions}",
        notification_type="medication",
        priority="high",
        read=False,
        sent_at=reminder_time or datetime.utcnow()
    )
    
    db.add(notification)
    await db.commit()
    
    # Schedule notification delivery if needed
    if reminder_time and reminder_time > datetime.utcnow():
        background_tasks.add_task(schedule_notification_delivery, notification.id)
    
    return {"message": "Medication reminder created"}


@router.post("/appointment-reminder/{appointment_id}")
async def create_appointment_reminder(
    appointment_id: int,
    background_tasks: BackgroundTasks,
    reminder_hours_before: int = 24,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Create an appointment reminder notification"""
    # Get appointment details
    appointment_result = await db.execute(
        select(Appointment).filter(Appointment.id == appointment_id)
    )
    appointment = appointment_result.scalar_one_or_none()
    
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    from app.models.models import Notification
    
    reminder_time = appointment.appointment_date - timedelta(hours=reminder_hours_before)
    
    notification = Notification(
        user_id=current_user.id,
        title="Upcoming Appointment",
        message=f"Your appointment with {appointment.doctor_name} is in {reminder_hours_before} hours. Please arrive 15 minutes early.",
        notification_type="appointment",
        priority="medium",
        read=False,
        sent_at=reminder_time if reminder_time <= datetime.utcnow() else datetime.utcnow()
    )
    
    db.add(notification)
    await db.commit()
    
    if reminder_time > datetime.utcnow():
        background_tasks.add_task(schedule_notification_delivery, notification.id)
    
    return {"message": "Appointment reminder created"}


@router.post("/health-alert")
async def create_health_alert(
    vital_type: str,
    current_value: float,
    threshold: float,
    severity: str,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a health alert notification"""
    from app.models.models import Notification
    
    priority_map = {
        "low": "medium",
        "moderate": "high",
        "high": "urgent",
        "critical": "urgent"
    }
    
    notification = Notification(
        user_id=current_user.id,
        title=f"{vital_type.title()} Alert",
        message=f"Your recent {vital_type} reading of {current_value} is {severity}. Consider contacting your healthcare provider.",
        notification_type="health_alert",
        priority=priority_map.get(severity, "medium"),
        read=False,
        sent_at=datetime.utcnow()
    )
    
    db.add(notification)
    await db.commit()
    
    # Send immediately for health alerts
    background_tasks.add_task(send_immediate_notification, notification.id)
    
    return {"message": "Health alert created"}


@router.get("/settings", response_model=NotificationSettingsResponse)
async def get_notification_settings(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get notification settings for the current user"""
    # In a real implementation, these would be stored in the database
    # For now, returning default settings
    return NotificationSettingsResponse(
        push_notifications=True,
        email_notifications=True,
        sms_notifications=False,
        medication_reminders=True,
        appointment_reminders=True,
        health_alerts=True,
        system_updates=False,
        reminder_frequency="30_minutes",
        quiet_hours_enabled=True,
        quiet_hours_start="22:00",
        quiet_hours_end="07:00"
    )


@router.put("/settings")
async def update_notification_settings(
    settings: NotificationSettingsResponse,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Update notification settings for the current user"""
    # In a real implementation, this would update the database
    # For now, just return success
    return {"message": "Notification settings updated successfully"}


# Background task functions
async def schedule_notification_delivery(notification_id: int):
    """Schedule notification delivery for the specified time"""
    # This would integrate with a task queue like Celery
    # For now, this is a placeholder
    print(f"Scheduling delivery for notification {notification_id}")


async def send_immediate_notification(notification_id: int):
    """Send notification immediately (for urgent alerts)"""
    # This would integrate with push notification services, email, SMS
    # For now, this is a placeholder
    print(f"Sending immediate notification {notification_id}")


@router.get("/check-overdue-medications")
async def check_overdue_medications(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Check for overdue medications and create reminder notifications"""
    # This would typically be run as a scheduled job
    now = datetime.utcnow()
    
    # Find medication notifications that are overdue and not read
    overdue_result = await db.execute(
        select(Notification).filter(
            Notification.user_id == current_user.id,
            Notification.notification_type == "medication",
            Notification.sent_at < now - timedelta(hours=1),  # 1 hour overdue
            Notification.read == False
        )
    )
    overdue_notifications = overdue_result.scalars().all()
    
    # Create follow-up reminders for overdue medications
    for notification in overdue_notifications:
        follow_up = Notification(
            user_id=current_user.id,
            title="Overdue Medication",
            message=f"You missed your medication dose. Please take it now if safe to do so.",
            notification_type="reminder",
            priority="high",
            read=False,
            sent_at=datetime.utcnow()
        )
        
        db.add(follow_up)
    
    await db.commit()
    
    return {"message": f"Checked for overdue medications, created {len(overdue_notifications)} follow-up reminders"}


@router.get("/realtime")
async def get_realtime_notifications(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get notifications for real-time updates"""
    # This would be used with WebSocket connections for real-time updates
    recent_result = await db.execute(
        select(Notification).filter(
            Notification.user_id == current_user.id,
            Notification.sent_at >= datetime.utcnow() - timedelta(minutes=5)
        )
    )
    recent_notifications = recent_result.scalars().all()
    
    return [NotificationResponse(
        id=n.id,
        type=n.notification_type,
        title=n.title,
        message=n.message,
        priority=n.priority,
        read=n.read,
        created_at=n.sent_at,
        scheduled_for=None,
        action_required=n.priority in ["high", "urgent"],
        metadata={}
    ) for n in recent_notifications]