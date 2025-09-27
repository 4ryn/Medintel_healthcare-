#!/usr/bin/env python3
"""
Migration script to update the vitals table schema
"""

import asyncio
from sqlalchemy import text
from app.database import engine


async def migrate_vitals_table():
    """Add missing columns to the vitals table"""
    async with engine.begin() as conn:
        print("🔄 Checking vitals table schema...")
        
        # Check if 'type' column exists
        result = await conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'vitals' AND column_name = 'type'
        """))
        type_exists = result.fetchone()
        
        if not type_exists:
            print("➕ Adding 'type' column to vitals table...")
            await conn.execute(text("""
                ALTER TABLE vitals 
                ADD COLUMN type VARCHAR NOT NULL DEFAULT 'blood_pressure_systolic'
            """))
            print("✅ Added 'type' column")
        else:
            print("✅ 'type' column already exists")
            
        # Check if 'value' column exists
        result = await conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'vitals' AND column_name = 'value'
        """))
        value_exists = result.fetchone()
        
        if not value_exists:
            print("➕ Adding 'value' column to vitals table...")
            await conn.execute(text("""
                ALTER TABLE vitals 
                ADD COLUMN value FLOAT NOT NULL DEFAULT 0.0
            """))
            print("✅ Added 'value' column")
        else:
            print("✅ 'value' column already exists")
            
        # Check if 'unit' column exists
        result = await conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'vitals' AND column_name = 'unit'
        """))
        unit_exists = result.fetchone()
        
        if not unit_exists:
            print("➕ Adding 'unit' column to vitals table...")
            await conn.execute(text("""
                ALTER TABLE vitals 
                ADD COLUMN unit VARCHAR NOT NULL DEFAULT 'mmHg'
            """))
            print("✅ Added 'unit' column")
        else:
            print("✅ 'unit' column already exists")
            
        # Check if 'status' column exists
        result = await conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'vitals' AND column_name = 'status'
        """))
        status_exists = result.fetchone()
        
        if not status_exists:
            print("➕ Adding 'status' column to vitals table...")
            await conn.execute(text("""
                ALTER TABLE vitals 
                ADD COLUMN status VARCHAR DEFAULT 'normal'
            """))
            print("✅ Added 'status' column")
        else:
            print("✅ 'status' column already exists")
            
        # Check if 'notes' column exists
        result = await conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'vitals' AND column_name = 'notes'
        """))
        notes_exists = result.fetchone()
        
        if not notes_exists:
            print("➕ Adding 'notes' column to vitals table...")
            await conn.execute(text("""
                ALTER TABLE vitals 
                ADD COLUMN notes TEXT
            """))
            print("✅ Added 'notes' column")
        else:
            print("✅ 'notes' column already exists")
        
        print("🎉 Vitals table migration completed!")


if __name__ == "__main__":
    asyncio.run(migrate_vitals_table())