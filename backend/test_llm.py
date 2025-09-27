import sys
sys.path.append('.')
from app.services.llm_service import LLMService
import json

# Test OCR text from the recent upload
test_ocr_text = 'fatihtlishnont\nBlosdPresirs,120/80\nHeartFas72bpm'

print('🔍 Testing LLM Medical Data Extraction')
print('=' * 50)
print(f'📄 Input OCR Text: {test_ocr_text}')
print('=' * 50)

try:
    # Initialize LLM service
    llm_service = LLMService()
    
    # Extract medical data
    result = llm_service.extract_medical_data(test_ocr_text)
    
    print('✅ LLM Extraction Result:')
    print(f'Success: {result.get("success", False)}')
    
    if result.get('success'):
        extracted_data = result.get('extracted_data', {})
        print('\n📊 COMPLETE Extracted Medical Data:')
        print(json.dumps(extracted_data, indent=2))
        
        # Check specific fields we expect
        print('\n🎯 Key Field Analysis:')
        patient_info = extracted_data.get('patient_info', {})
        vital_signs = extracted_data.get('vital_signs', {})
        
        print(f'Patient Name: {patient_info.get("name")}')
        print(f'Blood Pressure Systolic: {vital_signs.get("blood_pressure_systolic")}')
        print(f'Blood Pressure Diastolic: {vital_signs.get("blood_pressure_diastolic")}')
        print(f'Heart Rate: {vital_signs.get("heart_rate")}')
        
        # Show vital signs structure
        print(f'\n🩺 Vital Signs Structure: {vital_signs}')
        print(f'🧪 Patient Info Structure: {patient_info}')
        
    else:
        print(f'❌ Extraction failed: {result}')
        
except Exception as e:
    print(f'💥 Error during extraction: {e}')
    import traceback
    traceback.print_exc()