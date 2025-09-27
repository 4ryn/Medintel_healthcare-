#!/usr/bin/env python3
"""
Test script to verify image OCR extraction
"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.services.ocr_service import OCRService

def test_image_extraction():
    """Test image OCR extraction"""
    print("🖼️ Testing Image OCR Extraction")
    print("=" * 50)
    
    try:
        # Initialize OCR service
        ocr_service = OCRService()
        print("✅ OCR Service initialized successfully")
        
        # Test with image files
        test_files = [
            "uploads/test/1ac1df38-6a1e-4fba-9155-6106cb1489b9_bloddtest.png",
            "uploads/test/b971cbec-a371-4c79-8d1f-0118345eaec7_test_medical_document.png",
            "uploads/test/045226bf-7afc-4381-976d-67f0cd837780_test.jpg"
        ]
        
        for file_path in test_files:
            if os.path.exists(file_path):
                print(f"\n📷 Testing with image: {os.path.basename(file_path)}")
                result = ocr_service.extract_text(file_path)
                
                print(f"📊 EXTRACTION RESULTS:")
                print(f"   Success: {result.get('success', False)}")
                print(f"   Method: {result.get('method', 'Unknown')}")
                
                if result.get('success'):
                    text = result.get('full_text', '')
                    print(f"   Text Length: {len(text)} characters")
                    if text:
                        print(f"   Preview (first 300 chars):")
                        print("-" * 30)
                        print(text[:300] + "..." if len(text) > 300 else text)
                    else:
                        print("   No text extracted from image")
                else:
                    print(f"   Error: {result.get('error', 'Unknown error')}")
                break
        else:
            print("⚠️ No test image files found")
            
    except Exception as e:
        print(f"❌ Error during testing: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_image_extraction()