#!/usr/bin/env python3
"""
Test script to verify JPG upload functionality after OCR fixes
"""
import requests
import os
import json

def test_jpg_upload():
    """Test JPG image upload with the updated OCR functionality"""
    
    # Backend URL
    base_url = "http://localhost:8000"
    upload_url = f"{base_url}/api/v1/documents/upload-simple"
    
    # Test image path
    image_path = "test.jpg"
    
    if not os.path.exists(image_path):
        print(f"❌ Test image not found: {image_path}")
        return False
    
    print(f"🧪 Testing JPG upload with updated OCR functionality...")
    print(f"📁 Image: {image_path}")
    print(f"🌐 URL: {upload_url}")
    
    try:
        # Prepare the file for upload
        with open(image_path, 'rb') as file:
            files = {
                'file': ('test.jpg', file, 'image/jpeg')
            }
            
            # Data payload
            data = {
                'patient_id': 1,
                'document_type': 'lab_report'
            }
            
            print(f"📤 Uploading image...")
            
            # Make the POST request
            response = requests.post(upload_url, files=files, data=data)
            
            print(f"📊 Status Code: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Upload successful!")
                print(f"📋 Response:")
                print(json.dumps(result, indent=2))
                
                # Check if OCR extraction worked
                extracted_data = result.get('formatted_medical_data', {})
                document_analysis = extracted_data.get('document_analysis', {})
                
                if document_analysis.get('ocr_limitation'):
                    print(f"⚠️ OCR limitation detected: {document_analysis.get('suggested_action', 'No suggestion')}")
                    return False
                else:
                    print(f"🎉 OCR processing successful!")
                    
                    # Check for actual extracted text
                    raw_text = extracted_data.get('raw_text', '')
                    if raw_text and len(raw_text.strip()) > 20:
                        print(f"📝 Extracted text preview: {raw_text[:100]}...")
                        return True
                    else:
                        print(f"⚠️ Limited text extracted: '{raw_text[:50]}...'")
                        return False
                        
            else:
                print(f"❌ Upload failed with status {response.status_code}")
                print(f"Error: {response.text}")
                return False
                
    except requests.exceptions.ConnectionError:
        print(f"❌ Connection failed - is the backend server running on {base_url}?")
        return False
    except Exception as e:
        print(f"❌ Error during upload: {e}")
        return False

if __name__ == "__main__":
    print("🔧 Testing JPG Upload with OCR Fixes")
    print("=" * 50)
    
    success = test_jpg_upload()
    
    print("=" * 50)
    if success:
        print("🎊 TEST PASSED: JPG upload and OCR extraction working!")
    else:
        print("💥 TEST FAILED: Issues with JPG upload or OCR extraction")
    
    print("🔚 Test completed")