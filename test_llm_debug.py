#!/usr/bin/env python3
"""
Test script to debug LLM medical data extraction
"""
import sys
import os
sys.path.append('backend')

from backend.app.services.llm_service import LLMService
import json

def test_llm_extraction():
    """Test LLM extraction with the exact OCR text"""
    
    # Initialize LLM service
    llm_service = LLMService()
    
    # Test OCR text from the recent upload
    test_ocr_text = "fatihtlishnont\nBlosdPresirs,120/80\nHeartFas72bpm"
    
    print("🔍 Testing LLM Medical Data Extraction")
    print("=" * 50)
    print(f"📄 Input OCR Text: '{test_ocr_text}'")
    print("=" * 50)
    
    try:
        # Extract medical data
        result = llm_service.extract_medical_data(test_ocr_text)
        
        print("✅ LLM Extraction Result:")
        print(f"Success: {result.get('success', False)}")
        
        if result.get('success'):
            extracted_data = result.get('extracted_data', {})
            print("\n📊 Extracted Medical Data:")
            print(json.dumps(extracted_data, indent=2))
            
            # Check specific fields we expect
            print("\n🎯 Key Field Analysis:")
            patient_info = extracted_data.get('patient_info', {})
            vital_signs = extracted_data.get('vital_signs', {})
            
            print(f"Patient Name: {patient_info.get('name')}")
            print(f"Blood Pressure Systolic: {vital_signs.get('blood_pressure_systolic')}")
            print(f"Blood Pressure Diastolic: {vital_signs.get('blood_pressure_diastolic')}")
            print(f"Heart Rate: {vital_signs.get('heart_rate')}")
            
        else:
            print(f"❌ Extraction failed: {result}")
            
    except Exception as e:
        print(f"💥 Error during extraction: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_llm_extraction()