#!/usr/bin/env python3
"""
Debug OCR Service initialization and image processing
"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.services.ocr_service import OCRService

def debug_ocr_service():
    """Debug OCR Service"""
    print("🔍 Debugging OCR Service")
    print("=" * 50)
    
    try:
        # Initialize OCR service
        ocr_service = OCRService()
        print("✅ OCR Service initialized successfully")
        
        # Check attributes
        print(f"\n🔧 OCR Engine Status:")
        print(f"   paddle_available: {ocr_service.paddle_available}")
        print(f"   tesseract_available: {ocr_service.tesseract_available}")
        print(f"   Has paddle_ocr object: {hasattr(ocr_service, 'paddle_ocr')}")
        
        if hasattr(ocr_service, 'paddle_ocr'):
            print(f"   paddle_ocr object: {ocr_service.paddle_ocr}")
        
        # Test image path
        test_image = "uploads/test/1ac1df38-6a1e-4fba-9155-6106cb1489b9_bloddtest.png"
        
        if os.path.exists(test_image):
            print(f"\n📷 Testing with: {test_image}")
            print(f"   File exists: True")
            print(f"   File extension: {os.path.splitext(test_image)[1].lower()}")
            
            # Try direct PaddleOCR extraction
            if ocr_service.paddle_available:
                print("   Calling extract_text_paddle directly...")
                result = ocr_service.extract_text_paddle(test_image)
                print(f"   Direct PaddleOCR result: {result}")
            else:
                print("   PaddleOCR not available")
            
            # Try main extract_text method
            print("   Calling main extract_text method...")
            result = ocr_service.extract_text(test_image)
            print(f"   Main method result: {result}")
        else:
            print(f"\n❌ Test image not found: {test_image}")
            
    except Exception as e:
        print(f"❌ Error during debugging: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_ocr_service()