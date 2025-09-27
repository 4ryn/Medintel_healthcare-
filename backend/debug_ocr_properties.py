#!/usr/bin/env python3
"""
Debug PaddleOCR result properties
"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.services.ocr_service import OCRService

def debug_ocr_properties():
    """Debug PaddleOCR OCRResult properties"""
    print("🔍 Debugging OCR Result Properties")
    print("=" * 50)
    
    try:
        # Initialize OCR service
        ocr_service = OCRService()
        
        if not ocr_service.paddle_available:
            print("❌ PaddleOCR not available")
            return
        
        # Test image path
        test_image = "uploads/test/1ac1df38-6a1e-4fba-9155-6106cb1489b9_bloddtest.png"
        
        if os.path.exists(test_image):
            print(f"📷 Testing with: {test_image}")
            
            # Run PaddleOCR directly to see result format
            result = ocr_service.paddle_ocr.ocr(test_image)
            
            if result and len(result) > 0:
                ocr_result = result[0]
                print(f"OCR Result type: {type(ocr_result)}")
                print(f"OCR Result dir: {[attr for attr in dir(ocr_result) if not attr.startswith('_')]}")
                
                # Check for text attributes
                for attr in ['rec_texts', 'texts', 'text', 'words']:
                    if hasattr(ocr_result, attr):
                        value = getattr(ocr_result, attr)
                        print(f"  {attr}: {value[:5] if isinstance(value, list) and len(value) > 5 else value}")
                
                # Check if it's working as expected from our earlier debug
                print(f"  rec_texts (first 5): {ocr_result.rec_texts[:5] if hasattr(ocr_result, 'rec_texts') else 'Not found'}")
                print(f"  rec_scores (first 5): {ocr_result.rec_scores[:5] if hasattr(ocr_result, 'rec_scores') else 'Not found'}")
                
        else:
            print(f"❌ Test image not found: {test_image}")
            
    except Exception as e:
        print(f"❌ Error during debugging: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_ocr_properties()