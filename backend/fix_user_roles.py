#!/usr/bin/env python3
"""
Script to fix user roles and create missing patient profiles
"""

import asyncio
from sqlalchemy import text, select, update
from app.database import engine
from app.models.models import User, Patient
from datetime import datetime


async def fix_user_roles():
    """Fix user roles and create missing patient profiles"""
    async with engine.begin() as conn:
        print("🔧 Fixing user roles and patient profiles...")
        
        # Option 1: Change rachit@gmail.com from clinician to patient
        print("\n1. Changing rachit@gmail.com from clinician to patient...")
        await conn.execute(text("""
            UPDATE users 
            SET role = 'patient' 
            WHERE email = 'rachit@gmail.com'
        """))
        print("✅ Changed rachit@gmail.com to patient role")
        
        # Create patient profile for rachit@gmail.com
        print("2. Creating patient profile for rachit@gmail.com...")
        
        # Get the user ID for rachit@gmail.com
        result = await conn.execute(text("SELECT id FROM users WHERE email = 'rachit@gmail.com'"))
        user_row = result.fetchone()
        
        if user_row:
            user_id = user_row.id
            
            # Check if patient profile already exists
            result = await conn.execute(text("SELECT id FROM patients WHERE user_id = %s"), (user_id,))
            existing_patient = result.fetchone()
            
            if not existing_patient:
                # Create patient profile
                await conn.execute(text("""
                    INSERT INTO patients (user_id, clinic_id, created_at) 
                    VALUES (%s, 1, %s)
                """), (user_id, datetime.utcnow()))
                print(f"✅ Created patient profile for user ID {user_id}")
            else:
                print(f"✅ Patient profile already exists for user ID {user_id}")
        
        # Create patient profile for aryan@gmail.com if missing
        print("3. Creating patient profile for aryan@gmail.com if missing...")
        
        result = await conn.execute(text("SELECT id FROM users WHERE email = 'aryan@gmail.com'"))
        user_row = result.fetchone()
        
        if user_row:
            user_id = user_row.id
            
            # Check if patient profile already exists
            result = await conn.execute(text("SELECT id FROM patients WHERE user_id = %s"), (user_id,))
            existing_patient = result.fetchone()
            
            if not existing_patient:
                # Create patient profile
                await conn.execute(text("""
                    INSERT INTO patients (user_id, clinic_id, created_at) 
                    VALUES (%s, 1, %s)
                """), (user_id, datetime.utcnow()))
                print(f"✅ Created patient profile for user ID {user_id}")
            else:
                print(f"✅ Patient profile already exists for user ID {user_id}")
        
        print("\n🎉 User roles and patient profiles fixed!")


if __name__ == "__main__":
    asyncio.run(fix_user_roles())