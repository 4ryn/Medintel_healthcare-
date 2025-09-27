#!/usr/bin/env python3
"""
Debug PaddleOCR result format
"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.services.ocr_service import OCRService

def debug_paddle_result():
    """Debug PaddleOCR result format"""
    print("🔍 Debugging PaddleOCR Result Format")
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
            print("Running PaddleOCR directly...")
            result = ocr_service.paddle_ocr.ocr(test_image)
            
            print(f"Raw PaddleOCR result: {result}")
            print(f"Result type: {type(result)}")
            
            if result:
                print(f"Result length: {len(result)}")
                if len(result) > 0:
                    print(f"First element: {result[0]}")
                    print(f"First element type: {type(result[0])}")
                    
                    if result[0] and len(result[0]) > 0:
                        print(f"First line: {result[0][0]}")
                        print(f"First line type: {type(result[0][0])}")
            else:
                print("No result returned")
                
        else:
            print(f"❌ Test image not found: {test_image}")
            
    except Exception as e:
        print(f"❌ Error during debugging: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_paddle_result()