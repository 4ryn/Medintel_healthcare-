#!/usr/bin/env python3
"""
Test script to debug LLM extraction issues
"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.services.llm_service import LLMService
import json

def test_llm_extraction():
    """Test LLM extraction with sample medical text"""
    
    # Sample medical text to test extraction
    sample_text = """
    MEDICAL REPORT
    
    Patient Name: John Smith
    Patient ID: MR123456
    Date of Birth: 1980-05-15
    Report Date: 2024-01-15
    
    VITAL SIGNS:
    Blood Pressure: 140/90 mmHg
    Heart Rate: 75 bpm
    Weight: 80 kg
    Temperature: 98.6°F
    
    LABORATORY RESULTS:
    Glucose (fasting): 126 mg/dL
    HbA1c: 7.2%
    Total Cholesterol: 220 mg/dL
    Creatinine: 1.2 mg/dL
    BUN: 18 mg/dL
    
    MEDICATIONS:
    - Lisinopril 10mg daily
    - Metformin 500mg twice daily
    - Atorvastatin 20mg daily
    
    DIAGNOSIS:
    - Type 2 Diabetes Mellitus
    - Hypertension
    - Hyperlipidemia
    
    RECOMMENDATIONS:
    - Continue current medications
    - Follow-up in 3 months
    - Dietary counseling recommended
    """
    
    print("🧪 Testing LLM Extraction Service")
    print("=" * 50)
    
    try:
        # Initialize LLM service
        llm_service = LLMService()
        print("✅ LLM Service initialized successfully")
        
        # Test extraction
        print("\n🔍 Testing extraction with sample medical text...")
        result = llm_service.extract_medical_data(sample_text)
        
        # Print results
        print("\n📊 EXTRACTION RESULTS:")
        print("=" * 50)
        print(f"Success: {result.get('success', 'Unknown')}")
        
        if result.get('success'):
            extracted_data = result.get('extracted_data', {})
            
            # Print patient info
            patient_info = extracted_data.get('patient_info', {})
            print(f"\n👤 PATIENT INFO:")
            print(f"   Name: {patient_info.get('name', 'Not extracted')}")
            print(f"   ID: {patient_info.get('patient_id', 'Not extracted')}")
            print(f"   DOB: {patient_info.get('date_of_birth', 'Not extracted')}")
            
            # Print vital signs
            vital_signs = extracted_data.get('vital_signs', {})
            print(f"\n💗 VITAL SIGNS:")
            print(f"   BP Systolic: {vital_signs.get('blood_pressure_systolic', 'Not extracted')}")
            print(f"   BP Diastolic: {vital_signs.get('blood_pressure_diastolic', 'Not extracted')}")
            print(f"   Heart Rate: {vital_signs.get('heart_rate', 'Not extracted')}")
            print(f"   Weight: {vital_signs.get('weight', 'Not extracted')}")
            
            # Print lab results
            lab_results = extracted_data.get('laboratory_results', {})
            print(f"\n🧪 LAB RESULTS:")
            print(f"   Glucose: {lab_results.get('glucose_fasting', 'Not extracted')}")
            print(f"   HbA1c: {lab_results.get('hba1c', 'Not extracted')}")
            print(f"   Cholesterol: {lab_results.get('cholesterol_total', 'Not extracted')}")
            print(f"   Creatinine: {lab_results.get('creatinine', 'Not extracted')}")
            print(f"   BUN: {lab_results.get('bun', 'Not extracted')}")
            
            # Print medications
            medications = extracted_data.get('medications', [])
            print(f"\n💊 MEDICATIONS:")
            if medications:
                for med in medications:
                    print(f"   - {med}")
            else:
                print("   No medications extracted")
            
            # Print diagnoses
            diagnoses = extracted_data.get('diagnoses', [])
            print(f"\n🏥 DIAGNOSES:")
            if diagnoses:
                for diagnosis in diagnoses:
                    print(f"   - {diagnosis}")
            else:
                print("   No diagnoses extracted")
                
        else:
            print(f"❌ Extraction failed: {result.get('error', 'Unknown error')}")
            
        # Print raw response for debugging
        print(f"\n🔍 RAW LLM RESPONSE:")
        print("-" * 30)
        print(result.get('raw_response', 'No raw response available'))
        
    except Exception as e:
        print(f"❌ Error during testing: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_llm_extraction()