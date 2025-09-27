#!/usr/bin/env python3
"""
Script to inspect the database and check user/patient data
"""

import asyncio
from sqlalchemy import text, select
from app.database import engine
from app.models.models import User, Patient


async def inspect_database():
    """Check database tables and structure"""
    async with engine.begin() as conn:
        print("🔍 Checking all tables...")
        
        # List all tables
        result = await conn.execute(text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        """))
        tables = result.fetchall()
        
        print(f"📋 Tables found: {len(tables)}")
        for table in tables:
            print(f"  - {table.table_name}")
        
        # Check documents table specifically
        print("\n🔍 Checking documents table structure...")
        try:
            result = await conn.execute(text("""
                SELECT column_name, data_type, is_nullable 
                FROM information_schema.columns 
                WHERE table_name = 'documents'
                ORDER BY ordinal_position
            """))
            columns = result.fetchall()
            
            if columns:
                print("Documents table columns:")
                for col in columns:
                    nullable = "nullable" if col.is_nullable == "YES" else "not null"
                    print(f"  - {col.column_name}: {col.data_type} ({nullable})")
            else:
                print("❌ Documents table not found or has no columns!")
                
        except Exception as e:
            print(f"❌ Error checking documents table: {e}")
        
        # Check if documents table exists and has data
        try:
            print("\n🔍 Checking documents table data...")
            result = await conn.execute(text("SELECT COUNT(*) as count FROM documents"))
            count = result.fetchone()
            print(f"Documents count: {count.count if count else 0}")
        except Exception as e:
            print(f"❌ Error counting documents: {e}")
            
        print("\n🔍 Checking users table...")
        result = await conn.execute(text("SELECT id, email, full_name, role FROM users ORDER BY id LIMIT 5"))
        users = result.fetchall()
        
        if users:
            print("Users found:")
            for user in users:
                print(f"  ID: {user.id}, Email: {user.email}, Name: {user.full_name}, Role: {user.role}")
        else:
            print("No users found")
            
        print("\n🔍 Checking patients table...")
        result = await conn.execute(text("SELECT id, user_id FROM patients ORDER BY id LIMIT 5"))
        patients = result.fetchall()
        
        if patients:
            print("Patients found:")
            for patient in patients:
                print(f"  ID: {patient.id}, User ID: {patient.user_id}")
        else:
            print("No patients found")


if __name__ == "__main__":
    asyncio.run(inspect_database())