#!/usr/bin/env python3
"""
Test the OCR service directly to debug the issue
"""
import sys
import os

# Add the backend app to the path
sys.path.append(r"c:\Users\hp\Documents\GitHub\medintel-healthcare\backend")

def test_ocr_service():
    try:
        from app.services.ocr_service import OCRService
        
        # Test image path - using a small test image creation
        image_path = r"c:\Users\hp\Documents\GitHub\medintel-healthcare\test_simple.jpg"
        
        # Create a simple test image if it doesn't exist
        if not os.path.exists(image_path):
            print("📝 Creating a simple test image...")
            from PIL import Image, ImageDraw, ImageFont
            
            # Create a simple image with text
            img = Image.new('RGB', (400, 200), color='white')
            draw = ImageDraw.Draw(img)
            
            # Add some text
            try:
                # Try to use a default font
                font = ImageFont.load_default()
            except:
                font = None
            
            text = "Patient: John Doe\nBlood Pressure: 120/80\nHeart Rate: 72 bpm"
            draw.text((20, 50), text, fill='black', font=font)
            img.save(image_path)
            print(f"✅ Created test image: {image_path}")
        
        if not os.path.exists(image_path):
            print(f"❌ Test image not found: {image_path}")
            return
        
        print("🔧 Testing OCR Service directly...")
        ocr_service = OCRService()
        
        print(f"PaddleOCR available: {ocr_service.paddle_available}")
        print(f"Tesseract available: {ocr_service.tesseract_available}")
        
        # Test the extract_text method
        print("\n🔄 Testing extract_text method...")
        result = ocr_service.extract_text(image_path)
        
        print(f"OCR Result: {result}")
        
        if result.get("success"):
            text = result.get("full_text") or result.get("extracted_text") or result.get("raw_text")
            print(f"✅ Extracted text: {text}")
        else:
            print(f"❌ OCR failed: {result.get('error')}")
            
        # Try PaddleOCR directly if available
        if ocr_service.paddle_available:
            print("\n🔄 Testing PaddleOCR directly...")
            paddle_result = ocr_service.extract_text_paddle(image_path)
            print(f"PaddleOCR Result: {paddle_result}")
            
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_ocr_service()