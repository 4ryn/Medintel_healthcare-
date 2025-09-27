#!/usr/bin/env python3
"""
Test script to verify JPG image upload and text extraction functionality
"""

import requests
import json
import sys
import os

def test_image_upload():
    # Test endpoint
    url = "http://127.0.0.1:8000/api/v1/llm-extraction"
    
    # Find a test image file
    test_files = [
        "c:\\Users\\hp\\Documents\\GitHub\\medintel-healthcare\\test.jpg",
        "c:\\Users\\hp\\Documents\\GitHub\\medintel-healthcare\\backend\\uploads\\test\\045226bf-7afc-4381-976d-67f0cd837780_test.jpg"
    ]
    
    test_file = None
    for file_path in test_files:
        if os.path.exists(file_path):
            test_file = file_path
            break
    
    if not test_file:
        print("❌ No test image file found")
        print("Available test files:")
        for file_path in test_files:
            print(f"  - {file_path} (exists: {os.path.exists(file_path)})")
        return
    
    print(f"📁 Using test file: {test_file}")
    
    try:
        # Prepare the file for upload
        with open(test_file, 'rb') as f:
            files = {'file': (os.path.basename(test_file), f, 'image/jpeg')}
            
            print("🚀 Uploading image to backend...")
            response = requests.post(url, files=files, timeout=60)
        
        print(f"📊 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Upload successful!")
            print(f"📄 Response keys: {list(result.keys())}")
            
            # Check if extraction was successful
            if 'data' in result:
                extracted_data = result['data']
                if 'Extracted Medical Data' in extracted_data:
                    medical_data = extracted_data['Extracted Medical Data']
                    print("🩺 Medical data extraction successful!")
                    
                    # Show sample extracted data
                    if 'Additional Information' in medical_data:
                        doc_info = medical_data['Additional Information'].get('Document Info', {})
                        print(f"📋 Document Type: {doc_info.get('report_type', 'N/A')}")
                        print(f"🏥 Facility: {doc_info.get('facility', 'N/A')}")
                        
                        vital_signs = medical_data['Additional Information'].get('Vital Signs', {})
                        if vital_signs and any(v for v in vital_signs.values() if v is not None):
                            print("💓 Vital signs extracted successfully")
                        
                        lab_results = medical_data['Additional Information'].get('Laboratory Results', {})
                        if lab_results and any(v for v in lab_results.values() if v is not None):
                            print("🧪 Laboratory results extracted successfully")
                
                elif 'ocr_limitation' in extracted_data and extracted_data['ocr_limitation']:
                    print("⚠️  OCR Limitation detected - this might be the old response format")
                    print(f"📝 Processing Note: {extracted_data.get('processing_note', 'N/A')}")
                
                else:
                    print("📄 Raw extraction result:")
                    print(json.dumps(result, indent=2)[:500] + "..." if len(str(result)) > 500 else json.dumps(result, indent=2))
            
        else:
            print(f"❌ Upload failed: {response.status_code}")
            print(f"📄 Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"🚫 Network error: {e}")
    except Exception as e:
        print(f"💥 Unexpected error: {e}")

if __name__ == "__main__":
    print("🧪 Testing JPG Image Upload and Text Extraction")
    print("=" * 50)
    test_image_upload()