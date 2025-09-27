#!/usr/bin/env python3
"""
Test script for testing image upload with OCR to the backend server on port 8001
"""

import requests
import os

def test_upload():
    # Test the upload endpoint
    url = "http://127.0.0.1:8001/api/v1/documents/upload-simple"
    
    # Use the test image
    image_path = "test.jpg"
    
    if not os.path.exists(image_path):
        print(f"❌ Test image not found: {image_path}")
        return
    
    print("🔄 Uploading test image to new server on port 8001...")
    
    # Prepare the files and data
    files = {
        'file': ('test.jpg', open(image_path, 'rb'), 'image/jpeg')
    }
    data = {
        'document_type': 'lab_report'
    }
    
    try:
        response = requests.post(url, files=files, data=data)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Upload successful!")
            result = response.json()
            print("📄 OCR Results:")
            print(f"   Extracted Text: {result.get('data', {}).get('extracted_text', 'None')}")
            print(f"   Document Type: {result.get('data', {}).get('ai_analysis', {}).get('document_type', 'None')}")
            print(f"   Key Findings: {result.get('data', {}).get('ai_analysis', {}).get('key_findings', 'None')[:200]}...")
        else:
            print("❌ Upload failed!")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        files['file'][1].close()

if __name__ == "__main__":
    test_upload()