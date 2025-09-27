"""
Contact and Support API Routes
Handles contact form submissions, support tickets, and help requests
"""

from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

router = APIRouter(tags=["support"])


class ContactRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    subject: str = Field(..., min_length=5, max_length=200)
    message: str = Field(..., min_length=10, max_length=2000)
    category: Optional[str] = Field(default="general", description="Category: general, technical, billing, medical")


class SupportTicket(BaseModel):
    name: str
    email: EmailStr
    issue_type: str = Field(..., description="Type: bug, feature_request, account_issue, technical_support")
    priority: str = Field(default="medium", description="Priority: low, medium, high, urgent")
    description: str = Field(..., min_length=20, max_length=2000)
    steps_to_reproduce: Optional[str] = None
    expected_behavior: Optional[str] = None
    actual_behavior: Optional[str] = None


@router.post("/contact")
async def submit_contact_form(contact: ContactRequest) -> Dict[str, Any]:
    """Submit a contact form message"""
    try:
        # Generate a ticket ID
        ticket_id = f"CONTACT-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        # Log the contact request
        logger.info(f"📧 New contact form submission: {contact.subject} from {contact.email}")
        
        # In a real implementation, you would:
        # 1. Save to database
        # 2. Send email notification to support team
        # 3. Send confirmation email to user
        # 4. Create support ticket in ticketing system
        
        # For now, just log and return success
        contact_data = {
            "ticket_id": ticket_id,
            "name": contact.name,
            "email": contact.email,
            "subject": contact.subject,
            "message": contact.message,
            "category": contact.category,
            "submitted_at": datetime.now().isoformat(),
            "status": "received"
        }
        
        logger.info(f"✅ Contact form processed: {ticket_id}")
        
        return {
            "success": True,
            "message": "Your message has been received. We'll get back to you within 24 hours.",
            "ticket_id": ticket_id,
            "estimated_response_time": "24 hours"
        }
        
    except Exception as e:
        logger.error(f"❌ Error processing contact form: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit contact form")


@router.post("/support-ticket")
async def create_support_ticket(ticket: SupportTicket) -> Dict[str, Any]:
    """Create a technical support ticket"""
    try:
        # Generate a ticket ID
        ticket_id = f"SUPPORT-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        # Log the support ticket
        logger.info(f"🎫 New support ticket: {ticket.issue_type} from {ticket.email}")
        
        # In a real implementation, you would:
        # 1. Save to database with full ticket tracking
        # 2. Assign to appropriate support team member
        # 3. Send email notifications
        # 4. Create issue in project management system
        
        ticket_data = {
            "ticket_id": ticket_id,
            "name": ticket.name,
            "email": ticket.email,
            "issue_type": ticket.issue_type,
            "priority": ticket.priority,
            "description": ticket.description,
            "steps_to_reproduce": ticket.steps_to_reproduce,
            "expected_behavior": ticket.expected_behavior,
            "actual_behavior": ticket.actual_behavior,
            "created_at": datetime.now().isoformat(),
            "status": "open"
        }
        
        logger.info(f"✅ Support ticket created: {ticket_id}")
        
        # Determine response time based on priority
        response_times = {
            "urgent": "2 hours",
            "high": "4 hours", 
            "medium": "24 hours",
            "low": "48 hours"
        }
        
        return {
            "success": True,
            "message": f"Support ticket created successfully. Priority: {ticket.priority}",
            "ticket_id": ticket_id,
            "priority": ticket.priority,
            "estimated_response_time": response_times.get(ticket.priority, "24 hours"),
            "status": "open"
        }
        
    except Exception as e:
        logger.error(f"❌ Error creating support ticket: {e}")
        raise HTTPException(status_code=500, detail="Failed to create support ticket")


@router.get("/faq")
async def get_faq() -> Dict[str, Any]:
    """Get frequently asked questions"""
    faq_data = [
        {
            "id": 1,
            "category": "account",
            "question": "How do I reset my password?",
            "answer": "Click on 'Forgot Password' on the login page and follow the instructions sent to your email."
        },
        {
            "id": 2,
            "category": "documents",
            "question": "What file types can I upload?",
            "answer": "You can upload PDF files, and image files (JPG, PNG, BMP, TIFF) for medical documents."
        },
        {
            "id": 3,
            "category": "appointments",
            "question": "How do I schedule an appointment?",
            "answer": "Go to the 'Schedule Appointment' section, select your preferred provider and available time slot."
        },
        {
            "id": 4,
            "category": "vitals",
            "question": "How often should I record my vitals?",
            "answer": "For routine monitoring, recording vitals once a day is sufficient. Follow your healthcare provider's specific recommendations."
        },
        {
            "id": 5,
            "category": "privacy",
            "question": "Is my medical data secure?",
            "answer": "Yes, we use industry-standard encryption and comply with HIPAA regulations to protect your medical information."
        }
    ]
    
    return {
        "success": True,
        "faqs": faq_data
    }


@router.get("/contact-info")
async def get_contact_info() -> Dict[str, Any]:
    """Get contact information"""
    return {
        "success": True,
        "contact_info": {
            "email": "support@medintel-healthcare.com",
            "phone": "+1 (555) 123-4567",
            "address": "123 Healthcare Ave, Medical City, MC 12345",
            "business_hours": {
                "monday_friday": "8:00 AM - 6:00 PM",
                "saturday": "9:00 AM - 2:00 PM", 
                "sunday": "Closed"
            },
            "emergency_contact": "+1 (555) 911-HELP",
            "support_hours": "24/7 for urgent issues"
        }
    }