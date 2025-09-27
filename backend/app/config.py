from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Azure Cognitive Services
    DOCINTEL_API_KEY: str
    DOCINTEL_REGION: str
    DOCINTEL_ENDPOINT: str
    
    # Azure Speech Services
    SPEECHSERVICE_API_KEY: str
    SPEECHSERVICE_REGION: str
    SPEECHSERVICE_ENDPOINT: str
    
    # Database
    DATABASE_URL: str
    
    # Vector Database (Qdrant)
    QDRANT_URL: str
    QDRANT_API_KEY: str
    QDRANT_COLLECTION_NAME: str = "medintel"
    
    # AI/LLM
    OPENROUTER_API_KEY: str
    
    # JWT
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # Firebase
    FIREBASE_PROJECT_ID: Optional[str] = None
    FIREBASE_PRIVATE_KEY_ID: Optional[str] = None
    FIREBASE_PRIVATE_KEY: Optional[str] = None
    FIREBASE_CLIENT_EMAIL: Optional[str] = None
    FIREBASE_CLIENT_ID: Optional[str] = None
    
    # Environment
    ENVIRONMENT: str = "development"
    
    # API Configuration
    API_HOST: str = "localhost"
    API_PORT: int = 8000
    WEB_HOST: str = "localhost"
    WEB_PORT: int = 3000
    
    # NextAuth (Frontend only, but keeping for completeness)
    NEXTAUTH_SECRET: Optional[str] = None
    NEXTAUTH_URL: Optional[str] = None
    NODE_ENV: str = "development"
    
    # File Upload
    MAX_FILE_SIZE: int = 10485760  # 10MB
    UPLOAD_DIR: str = "./uploads"
    
    class Config:
        env_file = "../.env"
        extra = "ignore"  # Ignore extra fields in .env file


settings = Settings()