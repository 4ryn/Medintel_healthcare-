#!/usr/bin/env python3
"""
Database setup script for MedIntel Healthcare
Creates tables and seeds sample data for development
"""

import asyncio
import sys
import os
from datetime import datetime, timedelta
import json

# Add the parent directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine, Base, AsyncSessionLocal
from app.models.models import (
    User, Patient, Clinic, Vitals, CarePlan, AdherenceLog, 
    LabReport, RiskScore, Appointment, Notification
)
from app.routes.auth import get_password_hash
from app.services.vector_service import VectorService


async def create_tables():
    """Create all database tables"""
    print("🔧 Creating database tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Database tables created successfully")


async def seed_sample_data():
    """Seed the database with sample data for development"""
    print("🌱 Seeding sample data...")
    
    async with AsyncSessionLocal() as session:
        try:
            # Create sample users
            users_data = [
                {
                    "email": "patient1@demo.com",
                    "password": "password123",
                    "full_name": "John Doe",
                    "role": "patient"
                },
                {
                    "email": "patient2@demo.com", 
                    "password": "password123",
                    "full_name": "Jane Smith",
                    "role": "patient"
                },
                {
                    "email": "doctor@demo.com",
                    "password": "password123",
                    "full_name": "Dr. Sarah Wilson",
                    "role": "clinician"
                },
                {
                    "email": "clinic@demo.com",
                    "password": "password123",
                    "full_name": "MedCenter Clinic",
                    "role": "clinic_admin"
                }
            ]
            
            users = []
            for user_data in users_data:
                user = User(
                    email=user_data["email"],
                    hashed_password=get_password_hash(user_data["password"]),
                    full_name=user_data["full_name"],
                    role=user_data["role"]
                )
                session.add(user)
                users.append(user)
            
            await session.flush()  # Get user IDs
            
            # Create clinic profile
            clinic = Clinic(
                user_id=users[3].id,  # clinic_admin user
                clinic_name="MedCenter Clinic",
                address="123 Healthcare Ave, Medical City, MC 12345",
                phone="+1-555-0123",
                license_number="CLI-2024-001"
            )
            session.add(clinic)
            await session.flush()
            
            # Create patient profiles
            patients_data = [
                {
                    "user_id": users[0].id,
                    "clinic_id": clinic.id,
                    "date_of_birth": datetime(1985, 3, 15),
                    "gender": "Male",
                    "phone": "+1-555-0101",
                    "emergency_contact": "+1-555-0102",
                    "medical_conditions": ["diabetes", "hypertension"]
                },
                {
                    "user_id": users[1].id,
                    "clinic_id": clinic.id,
                    "date_of_birth": datetime(1992, 7, 22),
                    "gender": "Female", 
                    "phone": "+1-555-0201",
                    "emergency_contact": "+1-555-0202",
                    "medical_conditions": ["hypertension"]
                }
            ]
            
            patients = []
            for patient_data in patients_data:
                patient = Patient(**patient_data)
                session.add(patient)
                patients.append(patient)
            
            await session.flush()
            
            # Create sample vitals data
            vitals_data = []
            for i, patient in enumerate(patients):
                # Create 30 days of sample vitals
                for day in range(30):
                    date = datetime.utcnow() - timedelta(days=day)
                    
                    # Simulate realistic vitals with some variation
                    base_systolic = 130 + (i * 10) + (day % 20 - 10)
                    base_diastolic = 85 + (i * 5) + (day % 10 - 5)
                    base_glucose = 110 + (i * 20) + (day % 30 - 15)
                    
                    vitals = Vitals(
                        patient_id=patient.id,
                        blood_pressure_systolic=max(100, min(180, base_systolic)),
                        blood_pressure_diastolic=max(60, min(110, base_diastolic)),
                        heart_rate=70 + (day % 20 - 10),
                        weight=70.0 + (i * 10) + (day * 0.1),
                        blood_glucose_fasting=max(80, min(200, base_glucose)),
                        temperature=36.5 + (day % 10 * 0.1),
                        oxygen_saturation=98 + (day % 3),
                        recorded_at=date
                    )
                    vitals_data.append(vitals)
            
            session.add_all(vitals_data)
            
            # Create sample care plans
            care_plans_data = [
                {
                    "patient_id": patients[0].id,
                    "title": "Diabetes & Hypertension Management",
                    "description": "Comprehensive care plan for diabetes and blood pressure control",
                    "medications": [
                        {"name": "Metformin", "dosage": "500mg", "frequency": "twice daily"},
                        {"name": "Lisinopril", "dosage": "10mg", "frequency": "once daily"}
                    ],
                    "lifestyle_goals": [
                        "Monitor blood glucose twice daily",
                        "30-minute walk daily",
                        "Low-sodium diet",
                        "Weight management"
                    ],
                    "follow_up_schedule": {
                        "next_appointment": "2024-02-15",
                        "lab_work": "every 3 months",
                        "vitals_check": "weekly"
                    }
                },
                {
                    "patient_id": patients[1].id,
                    "title": "Hypertension Management",
                    "description": "Blood pressure monitoring and lifestyle modifications",
                    "medications": [
                        {"name": "Amlodipine", "dosage": "5mg", "frequency": "once daily"}
                    ],
                    "lifestyle_goals": [
                        "Daily blood pressure monitoring",
                        "Regular exercise 3x/week",
                        "DASH diet"
                    ],
                    "follow_up_schedule": {
                        "next_appointment": "2024-02-20",
                        "vitals_check": "daily"
                    }
                }
            ]
            
            care_plans = []
            for cp_data in care_plans_data:
                care_plan = CarePlan(**cp_data)
                session.add(care_plan)
                care_plans.append(care_plan)
            
            await session.flush()
            
            # Create sample risk scores
            risk_scores_data = []
            diseases = ["diabetes", "hypertension", "heart_disease", "copd", "ckd"]
            
            for patient in patients:
                for disease in diseases:
                    # Generate realistic risk scores
                    if disease in patient.medical_conditions:
                        risk_percentage = 60 + (hash(f"{patient.id}_{disease}") % 30)
                    else:
                        risk_percentage = 20 + (hash(f"{patient.id}_{disease}") % 40)
                    
                    risk_score = RiskScore(
                        patient_id=patient.id,
                        disease_type=disease,
                        risk_percentage=min(95, risk_percentage),
                        risk_factors=["Family history", "Lifestyle factors", "Current symptoms"],
                        confidence_score=0.85
                    )
                    risk_scores_data.append(risk_score)
            
            session.add_all(risk_scores_data)
            
            # Create sample notifications
            notifications_data = []
            for i, patient in enumerate(patients):
                notifications = [
                    {
                        "user_id": patient.user_id,
                        "title": "Medication Reminder",
                        "message": "Time to take your morning medication",
                        "notification_type": "reminder",
                        "priority": "normal"
                    },
                    {
                        "user_id": patient.user_id,
                        "title": "Blood Pressure Alert", 
                        "message": "Your recent blood pressure reading is elevated. Please monitor closely.",
                        "notification_type": "alert",
                        "priority": "high"
                    },
                    {
                        "user_id": patient.user_id,
                        "title": "Appointment Reminder",
                        "message": "You have an upcoming appointment on February 15th",
                        "notification_type": "reminder", 
                        "priority": "normal"
                    }
                ]
                
                for notif_data in notifications:
                    notification = Notification(**notif_data)
                    notifications_data.append(notification)
            
            session.add_all(notifications_data)
            
            await session.commit()
            print(f"✅ Created {len(users)} users")
            print(f"✅ Created {len(patients)} patients")
            print(f"✅ Created {len(vitals_data)} vitals records")
            print(f"✅ Created {len(care_plans)} care plans")
            print(f"✅ Created {len(risk_scores_data)} risk scores")
            print(f"✅ Created {len(notifications_data)} notifications")
            
        except Exception as e:
            print(f"❌ Error seeding data: {e}")
            await session.rollback()
            raise


async def initialize_vector_store():
    """Initialize Qdrant vector store"""
    print(" Initializing vector store...")
    try:
        vector_service = VectorService()
        await vector_service.initialize_collection()
        print(" Vector store initialized successfully")
    except Exception as e:
        print(f" Error initializing vector store: {e}")


async def main():
    """Main setup function"""
    print(" Setting up MedIntel Healthcare database...")
    
    try:
        # Create tables
        await create_tables()
        
        # Initialize vector store
        await initialize_vector_store()
        
        # Seed sample data
        await seed_sample_data()
        
        print("\n🎉 Database setup completed successfully!")
        print("\n📋 Sample accounts created:")
        print("   Patient 1: patient1@demo.com / password123")
        print("   Patient 2: patient2@demo.com / password123") 
        print("   Doctor: doctor@demo.com / password123")
        print("   Clinic Admin: clinic@demo.com / password123")
        print("\n🌐 You can now start the application:")
        print("   Backend: uvicorn main:app --reload")
        print("   Frontend: npm run dev")
        
    except Exception as e:
        print(f"❌ Setup failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())