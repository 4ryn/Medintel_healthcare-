#!/usr/bin/env python3
"""
Debug PaddleOCR with predict method
"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.services.ocr_service import OCRService

def debug_paddle_predict():
    """Test PaddleOCR predict method"""
    print("🔍 Testing PaddleOCR predict method")
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
            
            # Try the predict method instead
            print("Using predict method...")
            result = ocr_service.paddle_ocr.predict(test_image)
            
            print(f"Predict result type: {type(result)}")
            print(f"Predict result dir: {[attr for attr in dir(result) if not attr.startswith('_')]}")
            
            # Try to access the result as a dict or object
            if hasattr(result, 'json'):
                print(f"JSON method available: {result.json()}")
            
            # Check all possible text attributes
            for attr in ['rec_texts', 'texts', 'text', 'words', 'results']:
                if hasattr(result, attr):
                    value = getattr(result, attr)
                    print(f"  {attr}: {value}")
            
            # Try accessing as dictionary
            if isinstance(result, dict):
                print(f"Result as dict: {result}")
            else:
                # If it's an object, try to get its string representation
                print(f"Result str: {str(result)}")
                
        else:
            print(f"❌ Test image not found: {test_image}")
            
    except Exception as e:
        print(f"❌ Error during debugging: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_paddle_predict()