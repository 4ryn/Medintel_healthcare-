from fastapi import UploadFile
import aiofiles
import openai  
import os
import tempfile
from .ocr_service import OCRService
from .llm_service import LLMService

class LLMExtractionService:
    def __init__(self):
        self.ocr_service = OCRService()
        self.llm_service = LLMService()
    
    async def extract(self, file: UploadFile):
        """
        Extracts information from the uploaded file using OCR (for images) and LLM.
        """
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=self._get_file_extension(file.filename)) as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        try:
            # Determine if this is an image or text/PDF file
            if self._is_image_file(file.content_type):
                # Use OCR to extract text from image
                print(f"🖼️ Processing image file: {file.filename}")
                extracted_text = self.ocr_service.extract_text_from_image(temp_file_path)
                print(f"📄 OCR extracted {len(extracted_text)} characters")
            else:
                # For PDF/text files, read directly
                print(f"📄 Processing text/PDF file: {file.filename}")
                with open(temp_file_path, "r", encoding="utf-8", errors="ignore") as f:
                    extracted_text = f.read()
            
            if not extracted_text or len(extracted_text.strip()) < 10:
                return {
                    "error": "No text could be extracted from the file",
                    "extraction_status": "failed",
                    "file_type": file.content_type
                }
            
            # Use LLM to extract structured medical data
            print(f"🤖 Processing with LLM: {len(extracted_text)} characters")
            structured_data = await self.llm_service.extract_medical_data(extracted_text)
            
            return structured_data
            
        except Exception as e:
            print(f"❌ Error in LLM extraction: {str(e)}")
            return {
                "error": f"Extraction failed: {str(e)}",
                "extraction_status": "failed"
            }
        finally:
            # Clean up temporary file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
    
    def _is_image_file(self, content_type: str) -> bool:
        """Check if the file is an image"""
        image_types = ["image/jpeg", "image/jpg", "image/png", "image/tiff", "image/bmp"]
        return content_type in image_types
    
    def _get_file_extension(self, filename: str) -> str:
        """Get file extension from filename"""
        if not filename:
            return ".tmp"
        return os.path.splitext(filename)[1] or ".tmp"
