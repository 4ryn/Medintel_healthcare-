"""
Migration script to create missing Patient and Clinic records for existing users
"""

import asyncio
import asyncpg
from app.config import settings

async def fix_missing_profiles():
    """Create Patient records for users with role='patient' who don't have patient profiles"""
    
    conn = await asyncpg.connect(settings.DATABASE_URL)
    try:
        print("Checking for missing patient profiles...")
        
        # Find users with role 'patient' who don't have patient records
        missing_patients = await conn.fetch("""
            SELECT u.id, u.email, u.full_name 
            FROM users u 
            LEFT JOIN patients p ON u.id = p.user_id 
            WHERE u.role = 'patient' AND p.user_id IS NULL
        """)
        
        print(f"Found {len(missing_patients)} users with missing patient profiles")
        
        for user in missing_patients:
            print(f"Creating patient profile for {user['email']}")
            await conn.execute("""
                INSERT INTO patients (user_id, clinic_id, medical_conditions, created_at)
                VALUES ($1, NULL, '[]'::json, NOW())
            """, user['id'])
        
        # Find users with role 'clinic_admin' who don't have clinic records
        missing_clinics = await conn.fetch("""
            SELECT u.id, u.email, u.full_name 
            FROM users u 
            LEFT JOIN clinics c ON u.id = c.user_id 
            WHERE u.role = 'clinic_admin' AND c.user_id IS NULL
        """)
        
        print(f"Found {len(missing_clinics)} users with missing clinic profiles")
        
        for user in missing_clinics:
            print(f"Creating clinic profile for {user['email']}")
            await conn.execute("""
                INSERT INTO clinics (user_id, clinic_name, address, phone, license_number, created_at)
                VALUES ($1, $2, '', '', '', NOW())
            """, user['id'], f"{user['full_name']}'s Clinic")
        
        # Assign patients to the first clinic if they don't have one
        clinic_result = await conn.fetchrow("SELECT id FROM clinics LIMIT 1")
        if clinic_result:
            clinic_id = clinic_result['id']
            unassigned_patients = await conn.fetch("""
                SELECT id FROM patients WHERE clinic_id IS NULL
            """)
            
            print(f"Assigning {len(unassigned_patients)} patients to clinic {clinic_id}")
            for patient in unassigned_patients:
                await conn.execute("""
                    UPDATE patients SET clinic_id = $1 WHERE id = $2
                """, clinic_id, patient['id'])
        
        # Show final counts
        user_count = await conn.fetchval("SELECT COUNT(*) FROM users")
        patient_count = await conn.fetchval("SELECT COUNT(*) FROM patients")
        clinic_count = await conn.fetchval("SELECT COUNT(*) FROM clinics")
        
        print(f"\nFinal counts:")
        print(f"Users: {user_count}")
        print(f"Patients: {patient_count}")
        print(f"Clinics: {clinic_count}")
        
        # Show patient list for verification
        patients = await conn.fetch("""
            SELECT p.id, u.full_name, u.email, u.role, p.clinic_id
            FROM patients p
            JOIN users u ON p.user_id = u.id
            ORDER BY p.id
        """)
        
        print(f"\nPatient records:")
        for patient in patients:
            print(f"  ID: {patient['id']}, Name: {patient['full_name']}, Email: {patient['email']}, Clinic: {patient['clinic_id']}")
        
    except Exception as e:
        print(f"Error: {e}")
        await conn.close()
        raise
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(fix_missing_profiles())