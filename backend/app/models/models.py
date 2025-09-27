from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
from enum import Enum
import uuid


class UserRole(str, Enum):
    PATIENT = "patient"
    CLINIC_ADMIN = "clinic_admin"
    CLINICIAN = "clinician"


class DiseaseType(str, Enum):
    DIABETES = "diabetes"
    HYPERTENSION = "hypertension"
    HEART_DISEASE = "heart_disease"
    COPD = "copd"
    CKD = "ckd"


class DocumentType(str, Enum):
    LAB_REPORT = "lab_report"
    PRESCRIPTION = "prescription"
    MEDICAL_RECORD = "medical_record"
    IMAGING = "imaging"
    INSURANCE = "insurance"
    OTHER = "other"


class VitalType(str, Enum):
    BLOOD_PRESSURE_SYSTOLIC = "blood_pressure_systolic"
    BLOOD_PRESSURE_DIASTOLIC = "blood_pressure_diastolic"
    HEART_RATE = "heart_rate"
    TEMPERATURE = "temperature"
    WEIGHT = "weight"
    HEIGHT = "height"
    BLOOD_GLUCOSE_FASTING = "blood_glucose_fasting"
    BLOOD_GLUCOSE_POST_MEAL = "blood_glucose_post_meal"
    OXYGEN_SATURATION = "oxygen_saturation"


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, nullable=False)  # patient, clinic_admin, clinician
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    patient_profile = relationship("Patient", back_populates="user", uselist=False)
    clinic_profile = relationship("Clinic", back_populates="user", uselist=False)


class Clinic(Base):
    __tablename__ = "clinics"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    clinic_name = Column(String, nullable=False)
    address = Column(Text)
    phone = Column(String)
    license_number = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="clinic_profile")
    patients = relationship("Patient", back_populates="clinic")


class Patient(Base):
    __tablename__ = "patients"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    clinic_id = Column(Integer, ForeignKey("clinics.id"))
    date_of_birth = Column(DateTime)
    gender = Column(String)
    phone = Column(String)
    emergency_contact = Column(String)
    medical_conditions = Column(JSON)  # List of diseases
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="patient_profile")
    clinic = relationship("Clinic", back_populates="patients")
    vitals = relationship("Vitals", back_populates="patient")
    care_plans = relationship("CarePlan", back_populates="patient")
    lab_reports = relationship("LabReport", back_populates="patient")
    risk_scores = relationship("RiskScore", back_populates="patient")
    appointments = relationship("Appointment", back_populates="patient")
    documents = relationship("Document", back_populates="patient")


class Document(Base):
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer)
    document_type = Column(String, nullable=False)  # From DocumentType enum
    description = Column(Text)
    extracted_text = Column(Text)  # OCR extracted text
    structured_data = Column(JSON)  # AI extracted structured data
    ocr_confidence = Column(Float)  # OCR confidence score
    processing_status = Column(String, default="uploaded")  # uploaded, processing, completed, failed
    processing_error = Column(Text)  # Error message if processing failed
    upload_date = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    patient = relationship("Patient", back_populates="documents")


class Vitals(Base):
    __tablename__ = "vitals"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    type = Column(String, nullable=False)  # From VitalType enum
    value = Column(Float, nullable=False)  # Numeric value
    unit = Column(String, nullable=False)  # Unit of measurement
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())
    notes = Column(Text)
    status = Column(String, default="normal")  # normal, warning, critical
    
    # Legacy columns for backward compatibility (optional)
    blood_pressure_systolic = Column(Integer)
    blood_pressure_diastolic = Column(Integer)
    heart_rate = Column(Integer)
    weight = Column(Float)
    height = Column(Float)
    blood_glucose_fasting = Column(Float)
    blood_glucose_post_meal = Column(Float)
    temperature = Column(Float)
    oxygen_saturation = Column(Float)
    
    # Relationships
    patient = relationship("Patient", back_populates="vitals")


class CarePlan(Base):
    __tablename__ = "care_plans"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    medications = Column(JSON)  # List of medications with schedules
    lifestyle_goals = Column(JSON)  # List of lifestyle goals
    follow_up_schedule = Column(JSON)  # Schedule for follow-ups
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    patient = relationship("Patient", back_populates="care_plans")
    adherence_logs = relationship("AdherenceLog", back_populates="care_plan")


class AdherenceLog(Base):
    __tablename__ = "adherence_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    care_plan_id = Column(Integer, ForeignKey("care_plans.id"), nullable=False)
    task_type = Column(String, nullable=False)  # medication, exercise, diet, etc.
    task_description = Column(String, nullable=False)
    completed = Column(Boolean, default=False)
    scheduled_time = Column(DateTime(timezone=True), nullable=False)
    completed_time = Column(DateTime(timezone=True))
    notes = Column(Text)
    
    # Relationships
    care_plan = relationship("CarePlan", back_populates="adherence_logs")


class LabReport(Base):
    __tablename__ = "lab_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    report_type = Column(String, nullable=False)
    file_path = Column(String)
    extracted_data = Column(JSON)  # Structured data from OCR + LLM
    report_date = Column(DateTime(timezone=True))
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    processed = Column(Boolean, default=False)
    
    # Relationships
    patient = relationship("Patient", back_populates="lab_reports")


class RiskScore(Base):
    __tablename__ = "risk_scores"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    disease_type = Column(String, nullable=False)  # diabetes, hypertension, etc.
    risk_percentage = Column(Float, nullable=False)
    risk_factors = Column(JSON)  # Contributing factors
    confidence_score = Column(Float)
    calculated_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    patient = relationship("Patient", back_populates="risk_scores")


class Appointment(Base):
    __tablename__ = "appointments"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    clinician_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    appointment_type = Column(String, nullable=False)  # teleconsultation, in-person
    scheduled_time = Column(DateTime(timezone=True), nullable=False)
    duration_minutes = Column(Integer, default=30)
    status = Column(String, default="scheduled")  # scheduled, completed, cancelled
    meeting_link = Column(String)  # For teleconsultations
    notes = Column(Text)
    summary = Column(Text)  # AI-generated summary
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    patient = relationship("Patient", back_populates="appointments")


class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String, nullable=False)  # reminder, alert, info
    priority = Column(String, default="normal")  # low, normal, high, urgent
    read = Column(Boolean, default=False)
    sent_at = Column(DateTime(timezone=True), server_default=func.now())
    scheduled_for = Column(DateTime(timezone=True))  # For scheduled notifications