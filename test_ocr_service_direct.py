#!/usr/bin/env python3
"""
Test OCR service directly to see if Tesseract path fix works
"""
import sys
import os
sys.path.append('backend')

from backend.app.services.ocr_service import OCRService

def test_ocr_service():
    print("🔍 Testing OCR Service with direct Tesseract path...")
    
    try:
        ocr = OCRService()
        print(f"   Tesseract available: {ocr.tesseract_available}")
        
        if ocr.tesseract_available:
            # Test with our test image
            test_image_path = "test_simple.jpg"
            if os.path.exists(test_image_path):
                print(f"🖼️ Testing with image: {test_image_path}")
                result = ocr.extract_text(test_image_path)
                print(f"📄 Extracted text: {result}")
            else:
                print(f"❌ Test image not found: {test_image_path}")
        
    except Exception as e:
        print(f"❌ OCR Service test failed: {e}")

if __name__ == "__main__":
    test_ocr_service()