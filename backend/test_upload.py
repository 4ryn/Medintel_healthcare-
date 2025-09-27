"""
Simple document upload test without database dependency
"""

from fastapi import APIRouter, File, UploadFile, Form
from fastapi.responses import JSONResponse
import os
import uuid

router = APIRouter()

@router.post("/upload-simple")
async def upload_simple(
    file: UploadFile = File(...),
    document_type: str = Form(...)
) -> JSONResponse:
    """Simple upload test without database"""
    try:
        print(f"📄 Simple upload test: {file.filename}")
        
        # Basic file validation
        if not file.filename:
            return JSONResponse(
                status_code=400,
                content={
                    "success": False,
                    "message": "No file provided"
                }
            )
        
        # Read file content
        content = await file.read()
        file_size = len(content)
        
        # Save to uploads directory (optional)
        upload_dir = "uploads/test"
        os.makedirs(upload_dir, exist_ok=True)
        
        file_id = str(uuid.uuid4())
        file_path = os.path.join(upload_dir, f"{file_id}_{file.filename}")
        
        with open(file_path, "wb") as f:
            f.write(content)
        
        print(f"✅ File saved: {file_path}")
        
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": "File uploaded successfully",
                "data": {
                    "filename": file.filename,
                    "file_size": file_size,
                    "document_type": document_type,
                    "file_path": file_path,
                    "status": "uploaded"
                }
            }
        )
        
    except Exception as e:
        print(f"❌ Upload error: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "message": f"Upload failed: {str(e)}"
            }
        )