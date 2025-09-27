import asyncio
from app.database import engine, Base

async def recreate_tables():
    """Recreate all database tables"""
    print("🔄 Recreating database tables...")
    
    async with engine.begin() as conn:
        # Drop all tables
        await conn.run_sync(Base.metadata.drop_all)
        print("📥 Dropped all tables")
        
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)
        print("📤 Created all tables")
    
    print("✅ Database tables recreated successfully!")

if __name__ == "__main__":
    asyncio.run(recreate_tables())