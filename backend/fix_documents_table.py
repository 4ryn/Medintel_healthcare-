"""
Script to fix the documents table schema to match the model definition
"""
import sys
import os
import asyncio
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine
from sqlalchemy import text, Integer, String, Text, Float, DateTime, JSON
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def fix_documents_table():
    """Add missing columns to documents table"""
    try:
        async with engine.begin() as conn:
            # Check current table structure
            logger.info("Checking current documents table structure...")
            result = await conn.execute(text("""
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'documents'
                ORDER BY ordinal_position
            """))
            
            current_columns = [row[0] for row in result.fetchall()]
            logger.info(f"Current columns: {current_columns}")
            
            # Define required columns based on the model
            required_columns = [
                ('patient_id', 'INTEGER'),
                ('file_path', 'VARCHAR'),
                ('file_size', 'INTEGER'),
                ('document_type', 'VARCHAR'),
                ('description', 'TEXT'),
                ('extracted_text', 'TEXT'),
                ('structured_data', 'JSONB'),
                ('ocr_confidence', 'FLOAT'),
                ('processing_status', 'VARCHAR DEFAULT \'uploaded\''),
                ('processing_error', 'TEXT'),
                ('upload_date', 'TIMESTAMP WITH TIME ZONE DEFAULT NOW()')
            ]
            
            # Add missing columns
            for column_name, column_def in required_columns:
                if column_name not in current_columns:
                    logger.info(f"Adding column: {column_name}")
                    
                    # Handle special cases for columns with constraints
                    if column_name == 'patient_id':
                        # First add the column as nullable
                        await conn.execute(text(f"ALTER TABLE documents ADD COLUMN {column_name} INTEGER"))
                        # Set default patient_id to 1 for existing records
                        await conn.execute(text("UPDATE documents SET patient_id = 1 WHERE patient_id IS NULL"))
                        # Add the foreign key constraint
                        await conn.execute(text(f"ALTER TABLE documents ALTER COLUMN {column_name} SET NOT NULL"))
                        await conn.execute(text(f"ALTER TABLE documents ADD CONSTRAINT fk_documents_patient_id FOREIGN KEY (patient_id) REFERENCES patients(id)"))
                    elif column_name == 'file_path':
                        # Set a default value for existing records
                        await conn.execute(text(f"ALTER TABLE documents ADD COLUMN {column_name} VARCHAR"))
                        await conn.execute(text("UPDATE documents SET file_path = '/uploads/documents/legacy/' || filename WHERE file_path IS NULL"))
                        await conn.execute(text(f"ALTER TABLE documents ALTER COLUMN {column_name} SET NOT NULL"))
                    elif column_name == 'document_type':
                        # Set a default value for existing records
                        await conn.execute(text(f"ALTER TABLE documents ADD COLUMN {column_name} VARCHAR"))
                        await conn.execute(text("UPDATE documents SET document_type = 'other' WHERE document_type IS NULL"))
                        await conn.execute(text(f"ALTER TABLE documents ALTER COLUMN {column_name} SET NOT NULL"))
                    else:
                        # Add column with full definition
                        await conn.execute(text(f"ALTER TABLE documents ADD COLUMN {column_name} {column_def}"))
                        
                    logger.info(f"✅ Added column: {column_name}")
                else:
                    logger.info(f"✅ Column already exists: {column_name}")
            
            # Verify final structure
            logger.info("\n🔍 Final table structure:")
            result = await conn.execute(text("""
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns 
                WHERE table_name = 'documents'
                ORDER BY ordinal_position
            """))
            
            for row in result.fetchall():
                logger.info(f"  - {row[0]}: {row[1]} ({'nullable' if row[2] == 'YES' else 'not null'}) {f'default: {row[3]}' if row[3] else ''}")
            
            logger.info("\n✅ Documents table schema fixed successfully!")
            
    except Exception as e:
        logger.error(f"Error fixing documents table: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(fix_documents_table())