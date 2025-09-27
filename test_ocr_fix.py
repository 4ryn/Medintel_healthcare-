#!/usr/bin/env python3
"""
Quick test of image upload with updated OCR functionality
"""
import requests
import os

def test_image_upload():
    # Test image path - use the newly created test image
    image_path = r"c:\Users\hp\Documents\GitHub\medintel-healthcare\test_simple.jpg"
    
    if not os.path.exists(image_path):
        print(f"❌ Test image not found: {image_path}")
        return
    
    # Upload endpoint
    url = "http://localhost:8000/api/v1/documents/upload-simple"
    
    try:
        # Prepare the file upload
        with open(image_path, 'rb') as f:
            files = {'file': ('test.jpg', f, 'image/jpeg')}
            data = {
                'patient_id': '1',
                'document_type': 'lab_report'  # Add required field
            }
            
            print("🔄 Uploading test image...")
            response = requests.post(url, files=files, data=data)
            
            print(f"Status Code: {response.status_code}")
            if response.status_code == 200:
                result = response.json()
                print("✅ Upload successful!")
                print("📄 Full Response:")
                import json
                print(json.dumps(result, indent=2))
                
                # Print key parts of the response
                if 'message' in result:
                    print(f"\nMessage: {result['message']}")
                
                if 'extracted_data' in result:
                    extracted = result['extracted_data']
                    print(f"\nExtracted text: {extracted.get('extracted_text', 'No text')}")
                
                if 'formatted_medical_data' in result:
                    medical_data = result['formatted_medical_data']
                    print(f"\nMedical data type: {type(medical_data)}")
                    if isinstance(medical_data, dict):
                        print(f"Medical data keys: {list(medical_data.keys())}")
                        
                        # Check for OCR limitation
                        if medical_data.get('ocr_limitation'):
                            print("⚠️ OCR limitation detected")
                        
                        # Check for actual medical content
                        if 'document_info' in medical_data:
                            print(f"Document info: {medical_data['document_info']}")
                    elif isinstance(medical_data, str):
                        print(f"Medical data (string): {medical_data[:200]}...")
                
            else:
                print(f"❌ Upload failed: {response.text}")
                
    except Exception as e:
        print(f"❌ Test failed: {e}")

if __name__ == "__main__":
    test_image_upload()