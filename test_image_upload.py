#!/usr/bin/env python3
"""
Script to test image upload and AI processing functionality
"""
import requests
import os
from PIL import Image
import io

def create_test_image():
    """Create a simple test image with text"""
    # Create a simple image with text
    img = Image.new('RGB', (400, 200), color='white')
    
    # For testing purposes, we'll just create a simple colored rectangle
    # In a real scenario, you'd add text using PIL.ImageDraw
    
    # Save as bytes
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    img_byte_arr = img_byte_arr.getvalue()
    
    return img_byte_arr

def test_image_upload():
    """Test the image upload endpoint with AI processing"""
    
    # Create test image
    image_data = create_test_image()
    
    # Prepare the multipart form data
    files = {
        'file': ('test_medical_image.png', image_data, 'image/png')
    }
    
    data = {
        'document_type': 'lab_report',
        'description': 'Test medical image for AI processing'
    }
    
    try:
        # Upload the image
        response = requests.post(
            'http://localhost:8000/api/v1/documents/upload/',
            files=files,
            data=data
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 201:
            result = response.json()
            if result.get('success'):
                print("✅ Image upload successful!")
                
                # Check if AI processing was included
                if 'ai_analysis' in result.get('data', {}):
                    print("🤖 AI Analysis included:")
                    print(f"   Extracted Text: {result['data'].get('extracted_text', 'None')}")
                    print(f"   AI Analysis: {result['data'].get('ai_analysis', 'None')}")
                else:
                    print("⚠️ No AI analysis in response")
            else:
                print(f"❌ Upload failed: {result.get('message')}")
        else:
            print(f"❌ HTTP Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

def test_api_health():
    """Test if the API is running and accessible"""
    try:
        response = requests.get('http://localhost:8000/api/v1/documents/types/')
        if response.status_code == 200:
            print("✅ API is running and accessible")
            print(f"Available document types: {response.json()}")
            return True
        else:
            print(f"❌ API not accessible: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Cannot connect to API: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing MedIntel Healthcare API - Image Upload & AI Processing")
    print("=" * 60)
    
    # Test API health first
    if test_api_health():
        print("\n📤 Testing image upload with AI processing...")
        test_image_upload()
    else:
        print("❌ Cannot proceed - API is not accessible")
    
    print("\n✅ Test completed!")