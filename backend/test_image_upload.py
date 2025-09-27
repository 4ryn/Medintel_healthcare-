#!/usr/bin/env python3
"""
Test script for image upload and OCR extraction
"""

import requests
import os
import json

def test_image_upload():
    """Test uploading an image to the LLM extraction endpoint"""
    
    # API endpoint
    url = "http://localhost:8000/api/v1/llm-extraction"
    
    # Find test image
    test_image_path = None
    possible_paths = [
        "uploads/test/test.jpg",
        "../test.jpg",
        "test.jpg"
    ]
    
    for path in possible_paths:
        if os.path.exists(path):
            test_image_path = path
            break
    
    if not test_image_path:
        print("❌ No test image found. Looking for available test files...")
        test_dir = "uploads/test/"
        if os.path.exists(test_dir):
            files = [f for f in os.listdir(test_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
            if files:
                test_image_path = os.path.join(test_dir, files[0])
                print(f"✅ Found test image: {test_image_path}")
            else:
                print("❌ No image files found in uploads/test/")
                return
        else:
            print("❌ Test directory not found")
            return
    
    print(f"🖼️ Testing image upload: {test_image_path}")
    
    try:
        # Upload image
        with open(test_image_path, 'rb') as file:
            files = {'file': (os.path.basename(test_image_path), file, 'image/jpeg')}
            response = requests.post(url, files=files, timeout=60)
        
        print(f"📡 Response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Upload successful!")
            print(f"🎯 Success: {result.get('success', False)}")
            
            if result.get('success'):
                print("📊 Extracted data structure:")
                data = result.get('data', {})
                if 'Extracted Medical Data' in data:
                    medical_data = data['Extracted Medical Data']
                    print(f"   - Patient Info: {bool(medical_data.get('patient_info'))}")
                    print(f"   - Document Info: {bool(medical_data.get('document_info'))}")
                    print(f"   - Vital Signs: {bool(medical_data.get('vital_signs'))}")
                    print(f"   - Lab Results: {bool(medical_data.get('laboratory_results'))}")
                    print(f"   - Additional Info: {bool(medical_data.get('Additional Information'))}")
                else:
                    print("📄 Raw response structure:")
                    print(json.dumps(result, indent=2)[:500] + "...")
            else:
                print(f"❌ Extraction failed: {result.get('error', 'Unknown error')}")
        else:
            print(f"❌ Request failed: {response.status_code}")
            try:
                error_data = response.json()
                print(f"   Error: {error_data.get('error', 'Unknown error')}")
            except:
                print(f"   Raw response: {response.text[:200]}...")
                
    except Exception as e:
        print(f"❌ Error during test: {str(e)}")

if __name__ == "__main__":
    test_image_upload()