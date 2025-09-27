#!/usr/bin/env python3
"""
Test script to debug PDF text extraction
"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.services.ocr_service import OCRService
import tempfile

def test_pdf_extraction():
    """Test PDF text extraction"""
    print("🧪 Testing PDF Text Extraction")
    print("=" * 50)
    
    try:
        # Initialize OCR service
        ocr_service = OCRService()
        print("✅ OCR Service initialized successfully")
        
        # Check OCR engines availability
        print(f"\n🔧 OCR Engine Status:")
        print(f"   PaddleOCR available: {ocr_service.paddle_available}")
        print(f"   Tesseract available: {ocr_service.tesseract_available}")
        
        # Test with sample file if available
        test_files = [
            "uploads/test/15ec7b6e-dcdc-4939-826e-c9595a34349f_test.pdf",
            "uploads/test/1ac1df38-6a1e-4fba-9155-6106cb1489b9_bloddtest.png",
            "uploads/test/b971cbec-a371-4c79-8d1f-0118345eaec7_test_medical_document.png"
        ]
        
        test_file = None
        for file_path in test_files:
            if os.path.exists(file_path):
                test_file = file_path
                break
        
        if test_file:
            print(f"\n📄 Testing with file: {test_file}")
            result = ocr_service.extract_text(test_file)
            
            print(f"\n📊 EXTRACTION RESULTS:")
            print(f"   Success: {result.get('success', False)}")
            print(f"   Method: {result.get('method', 'Unknown')}")
            
            if result.get('success'):
                text = result.get('full_text', '')
                print(f"   Text Length: {len(text)} characters")
                print(f"   Preview (first 500 chars):")
                print("-" * 30)
                print(text[:500] + "..." if len(text) > 500 else text)
            else:
                print(f"   Error: {result.get('error', 'Unknown error')}")
        else:
            print("\n⚠️ No test PDF file found. Testing basic OCR functionality...")
            
            # Create a simple test to verify OCR is working
            print("   OCR service appears to be configured correctly.")
            if not ocr_service.paddle_available and not ocr_service.tesseract_available:
                print("   ⚠️ Warning: No OCR engines are available!")
                print("   To install Tesseract:")
                print("     - Windows: Download from https://github.com/UB-Mannheim/tesseract/wiki")
                print("     - Linux: sudo apt-get install tesseract-ocr")
                print("     - Mac: brew install tesseract")
                print("   To install PaddleOCR:")
                print("     pip install paddlepaddle paddleocr")
            
    except Exception as e:
        print(f"❌ Error during testing: {str(e)}")
        import traceback
        traceback.print_exc()

def test_end_to_end_extraction():
    """Test complete end-to-end extraction"""
    print("\n\n🔄 Testing End-to-End Extraction")
    print("=" * 50)
    
    try:
        from app.services.llm_extraction_service import LLMExtractionService
        
        # Initialize service
        extraction_service = LLMExtractionService()
        print("✅ LLM Extraction Service initialized")
        
        # Test with sample file if available
        test_files = [
            "uploads/test/15ec7b6e-dcdc-4939-826e-c9595a34349f_test.pdf",
            "uploads/test/1ac1df38-6a1e-4fba-9155-6106cb1489b9_bloddtest.png",
            "uploads/test/b971cbec-a371-4c79-8d1f-0118345eaec7_test_medical_document.png"
        ]
        
        for file_path in test_files:
            if os.path.exists(file_path):
                print(f"\n📄 Testing end-to-end extraction with: {file_path}")
                
                # Create a mock file object
                class MockFile:
                    def __init__(self, file_path):
                        self.filename = os.path.basename(file_path)
                        self.file_path = file_path
                    
                    async def read(self):
                        with open(self.file_path, 'rb') as f:
                            return f.read()
                
                mock_file = MockFile(file_path)
                
                # Test extraction (this would normally be async)
                # For now, just test the OCR part
                ocr_service = OCRService()
                ocr_result = ocr_service.extract_text(file_path)
                
                if ocr_result.get('success'):
                    print("✅ OCR extraction successful")
                    extracted_text = ocr_result.get('full_text', '')
                    
                    # Test LLM extraction
                    from app.services.llm_service import LLMService
                    llm_service = LLMService()
                    llm_result = llm_service.extract_medical_data(extracted_text)
                    
                    if llm_result.get('success'):
                        print("✅ LLM extraction successful")
                        print("🎉 End-to-end extraction working!")
                    else:
                        print(f"❌ LLM extraction failed: {llm_result.get('error')}")
                else:
                    print(f"❌ OCR extraction failed: {ocr_result.get('error')}")
                break
        else:
            print("⚠️ No test files found for end-to-end testing")
            
    except Exception as e:
        print(f"❌ Error during end-to-end testing: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_pdf_extraction()
    test_end_to_end_extraction()