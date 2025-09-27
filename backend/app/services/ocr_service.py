import cv2
import numpy as np
from PIL import Image
import pytesseract
from typing import Optional, Dict, Any, Union
import os
import logging
import json
from .llm_service import LLMService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class OCRService:
    def __init__(self):
        """Initialize OCR service with Tesseract and LLM integration"""
        # Set Tesseract executable path for Windows
        tesseract_path = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
        if os.path.exists(tesseract_path):
            pytesseract.pytesseract.tesseract_cmd = tesseract_path
            logger.info(f"🔧 Tesseract path set to: {tesseract_path}")
        
        # Check Tesseract availability
        try:
            pytesseract.get_tesseract_version()
            self.tesseract_available = True
            logger.info("✅ Tesseract OCR available")
        except Exception as e:
            logger.warning(f"⚠️ Tesseract OCR not available: {e}")
            self.tesseract_available = False
        
        # Initialize LLM service for intelligent data extraction
        self.llm_service = LLMService()
        
        # PaddleOCR initialization
        self.paddle_available = False
        try:
            import paddleocr
            self.paddle_ocr = paddleocr.PaddleOCR(use_angle_cls=True, lang='en')
            self.paddle_available = True
            logger.info("✅ PaddleOCR initialized successfully")
        except Exception as e:
            logger.warning(f"⚠️ PaddleOCR not available: {e}")
    
    def preprocess_image(self, image_path: str) -> np.ndarray:
        """Preprocess image for better OCR results"""
        try:
            # Read image
            if not os.path.exists(image_path):
                raise FileNotFoundError(f"Image file not found: {image_path}")
            
            image = cv2.imread(image_path)
            if image is None:
                raise ValueError(f"Could not read image: {image_path}")
            
            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Apply noise reduction
            denoised = cv2.fastNlMeansDenoising(gray)
            
            # Apply adaptive thresholding
            thresh = cv2.adaptiveThreshold(
                denoised, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                cv2.THRESH_BINARY, 11, 2
            )
            
            return thresh
        except Exception as e:
            logger.error(f"❌ Image preprocessing failed: {e}")
            # Return original image if preprocessing fails
            try:
                return cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
            except:
                raise ValueError(f"Could not process image: {image_path}")
    
    def extract_text_tesseract(self, image_path: str) -> Dict[str, Any]:
        """Extract text using Tesseract OCR"""
        try:
            if not self.tesseract_available:
                return {"method": "Tesseract", "success": False, "error": "Tesseract not available"}
            
            # Preprocess image
            processed_image = self.preprocess_image(image_path)
            
            # Configure Tesseract for better medical text recognition
            custom_config = r'--oem 3 --psm 6 -c tessedit_char_whitelist=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,()/-:% '
            
            # Extract text
            text = pytesseract.image_to_string(processed_image, config=custom_config)
            
            # Get detailed data for confidence scores
            data = pytesseract.image_to_data(processed_image, output_type=pytesseract.Output.DICT)
            
            # Calculate average confidence
            confidences = [int(conf) for conf in data['conf'] if int(conf) > 0]
            avg_confidence = sum(confidences) / len(confidences) if confidences else 0
            
            return {
                "method": "Tesseract",
                "full_text": text.strip(),
                "average_confidence": avg_confidence / 100,  # Normalize to 0-1
                "success": True
            }
        except Exception as e:
            logger.error(f"❌ Tesseract extraction failed: {e}")
            return {"method": "Tesseract", "success": False, "error": str(e)}
    
    def extract_text_from_pdf(self, pdf_path: str) -> Dict[str, Any]:
        """Extract text from PDF file"""
        try:
            # Try using PyMuPDF first
            try:
                import fitz  # PyMuPDF
                
                doc = fitz.open(pdf_path)
                full_text = ""
                
                for page_num in range(len(doc)):
                    page = doc.load_page(page_num)
                    text = page.get_text()
                    full_text += text + "\n"
                
                doc.close()
                
                return {
                    "method": "PyMuPDF",
                    "full_text": full_text.strip(),
                    "success": True
                }
            except ImportError:
                # Fallback to basic PDF text extraction
                logger.warning("PyMuPDF not available, falling back to basic extraction")
                return {
                    "method": "Basic",
                    "full_text": "PDF text extraction requires PyMuPDF (pip install pymupdf)",
                    "success": False,
                    "error": "PyMuPDF not installed"
                }
        except Exception as e:
            logger.error(f"❌ PDF text extraction failed: {e}")
            return {"method": "PDF", "success": False, "error": str(e)}
    
    def extract_text_paddle(self, image_path: str) -> Dict[str, Any]:
        """Extract text using PaddleOCR"""
        try:
            if not self.paddle_available:
                return {"method": "PaddleOCR", "success": False, "error": "PaddleOCR not available"}
            
            # Run PaddleOCR using the predict method (recommended)
            result = self.paddle_ocr.predict(image_path)
            
            # Extract text and confidence scores from the correct format
            if result and len(result) > 0:
                ocr_result = result[0]  # Get the first (and usually only) result dictionary
                texts = ocr_result.get('rec_texts', [])
                scores = ocr_result.get('rec_scores', [])
                
                # Combine all text
                full_text = " ".join(texts)
                
                # Calculate average confidence
                avg_confidence = sum(scores) / len(scores) if scores else 0
                
                # Create text blocks with bounding boxes if available
                text_blocks = []
                bboxes = ocr_result.get('rec_polys', [])
                for i, (text, score) in enumerate(zip(texts, scores)):
                    bbox = bboxes[i] if i < len(bboxes) else None
                    text_blocks.append({
                        "text": text,
                        "confidence": score,
                        "bbox": bbox.tolist() if bbox is not None else None
                    })
                
                return {
                    "method": "PaddleOCR",
                    "full_text": full_text.strip(),
                    "text_blocks": text_blocks,
                    "average_confidence": avg_confidence,
                    "success": True
                }
            else:
                return {
                    "method": "PaddleOCR",
                    "full_text": "",
                    "success": True,
                    "message": "No text detected in image"
                }
        except Exception as e:
            logger.error(f"❌ PaddleOCR extraction failed: {e}")
            return {"method": "PaddleOCR", "success": False, "error": str(e)}
    
    def extract_text(self, file_path: str) -> Dict[str, Any]:
        """Main method to extract text from any supported file format"""
        try:
            if not os.path.exists(file_path):
                return {
                    "success": False,
                    "error": f"File not found: {file_path}"
                }
            
            file_extension = os.path.splitext(file_path)[1].lower()
            
            # Handle PDF files
            if file_extension == '.pdf':
                return self.extract_text_from_pdf(file_path)
            
            # Handle image files
            elif file_extension in ['.jpg', '.jpeg', '.png', '.bmp', '.tiff']:
                # Try PaddleOCR first, fallback to Tesseract
                if self.paddle_available:
                    result = self.extract_text_paddle(file_path)
                    if result.get("success"):
                        return result
                
                if self.tesseract_available:
                    return self.extract_text_tesseract(file_path)
                
                return {
                    "success": False,
                    "error": "No OCR engine available. Please install Tesseract."
                }
            
            else:
                return {
                    "success": False,
                    "error": f"Unsupported file format: {file_extension}"
                }
        
        except Exception as e:
            logger.error(f"❌ Text extraction failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }


# Simplified service for initial setup
def create_mock_ocr_service():
    """Create a mock OCR service for testing when OCR engines aren't available"""
    class MockOCRService:
        def __init__(self):
            self.tesseract_available = False
            self.paddle_available = False
            logger.info("ℹ️ Using Mock OCR Service for testing")
        
        def extract_text(self, file_path: str) -> Dict[str, Any]:
            """Mock text extraction for testing"""
            return {
                "method": "Mock",
                "full_text": "Sample extracted text: Blood Pressure: 120/80 mmHg, Heart Rate: 72 bpm, Weight: 70kg",
                "success": True,
                "mock": True
            }
    
    return MockOCRService()


# Example usage and testing
if __name__ == "__main__":
    try:
        ocr = OCRService()
        print(f"✅ OCR Service initialized")
        print(f"Tesseract available: {ocr.tesseract_available}")
        print(f"PaddleOCR available: {ocr.paddle_available}")
        
        if not ocr.tesseract_available and not ocr.paddle_available:
            print("ℹ️ No OCR engines available - using mock service for testing")
            mock_ocr = create_mock_ocr_service()
            result = mock_ocr.extract_text("test.jpg")
            print(f"Mock extraction: {result}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        print("ℹ️ Using mock OCR service")