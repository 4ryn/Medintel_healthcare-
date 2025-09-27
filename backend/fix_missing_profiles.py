"""
Migration script to create missing Patient and Clinic records for existing users
Run this with: python fix_missing_profiles.py
"""

import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from app.database import get_db, engine
from app.models.models import User, Patient, Clinic

async def fix_missing_profiles():
    """Create Patient records for users with role='patient' who don't have patient profiles"""
    
    async with AsyncSession(engine) as db:
        try:
            print("Checking for missing patient profiles...")
            
            # Find users with role 'patient' who don't have patient records
            result = await db.execute(
                text("""
                    SELECT u.id, u.email, u.full_name 
                    FROM users u 
                    LEFT JOIN patients p ON u.id = p.user_id 
                    WHERE u.role = 'patient' AND p.user_id IS NULL
                """)
            )
            missing_patients = result.fetchall()
            
            print(f"Found {len(missing_patients)} users with missing patient profiles")
            
            for user in missing_patients:
                print(f"Creating patient profile for {user.email}")
                db_patient = Patient(
                    user_id=user.id,
                    clinic_id=None,
                    medical_conditions=[]
                )
                db.add(db_patient)
            
            # Find users with role 'clinic_admin' who don't have clinic records
            result = await db.execute(
                text("""
                    SELECT u.id, u.email, u.full_name 
                    FROM users u 
                    LEFT JOIN clinics c ON u.id = c.user_id 
                    WHERE u.role = 'clinic_admin' AND c.user_id IS NULL
                """)
            )
            missing_clinics = result.fetchall()
            
            print(f"Found {len(missing_clinics)} users with missing clinic profiles")
            
            for user in missing_clinics:
                print(f"Creating clinic profile for {user.email}")
                db_clinic = Clinic(
                    user_id=user.id,
                    clinic_name=f"{user.full_name}'s Clinic",
                    address="",
                    phone="",
                    license_number=""
                )
                db.add(db_clinic)
            
            await db.commit()
            
            # Assign patients to the first clinic if they don't have one
            clinic_result = await db.execute(select(Clinic).limit(1))
            clinic = clinic_result.scalar_one_or_none()
            
            if clinic:
                unassigned_result = await db.execute(
                    select(Patient).filter(Patient.clinic_id.is_(None))
                )
                unassigned_patients = unassigned_result.scalars().all()
                
                print(f"Assigning {len(unassigned_patients)} patients to clinic {clinic.id}")
                for patient in unassigned_patients:
                    patient.clinic_id = clinic.id
                
                await db.commit()
            
            # Show final counts
            user_count = await db.execute(text("SELECT COUNT(*) FROM users"))
            patient_count = await db.execute(text("SELECT COUNT(*) FROM patients"))
            clinic_count = await db.execute(text("SELECT COUNT(*) FROM clinics"))
            
            print(f"\nFinal counts:")
            print(f"Users: {user_count.scalar()}")
            print(f"Patients: {patient_count.scalar()}")
            print(f"Clinics: {clinic_count.scalar()}")
            
            # Show patient list for verification
            result = await db.execute(
                text("""
                    SELECT p.id, u.full_name, u.email, u.role, p.clinic_id
                    FROM patients p
                    JOIN users u ON p.user_id = u.id
                    ORDER BY p.id
                """)
            )
            patients = result.fetchall()
            
            print(f"\nPatient records:")
            for patient in patients:
                print(f"  ID: {patient.id}, Name: {patient.full_name}, Email: {patient.email}, Clinic: {patient.clinic_id}")
            
        except Exception as e:
            print(f"Error: {e}")
            await db.rollback()
            raise

if __name__ == "__main__":
    asyncio.run(fix_missing_profiles())