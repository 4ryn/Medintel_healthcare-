#!/usr/bin/env python3
"""
Simple test for AI processing without database dependency
"""
import requests
from PIL import Image
import io

def create_test_image():
    """Create a simple test image"""
    img = Image.new('RGB', (400, 200), color='white')
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    img_byte_arr = img_byte_arr.getvalue()
    return img_byte_arr

def test_ai_processing():
    """Test the AI processing endpoint"""
    
    # Create test image
    image_data = create_test_image()
    
    # Prepare the multipart form data
    files = {
        'file': ('test_medical_image.png', image_data, 'image/png')
    }
    
    try:
        # Test the AI processing
        response = requests.post(
            'http://localhost:8000/api/v1/documents/test-ai-processing',
            files=files
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ AI Processing Test Result:")
            print(f"   Success: {result.get('success')}")
            print(f"   Message: {result.get('message')}")
            
            data = result.get('data', {})
            print(f"   Filename: {data.get('filename')}")
            print(f"   File Size: {data.get('file_size')} bytes")
            print(f"   Is Image: {data.get('is_image')}")
            print(f"   Processing Status: {data.get('processing_status')}")
            
            if 'extracted_text' in data:
                print(f"   📝 Extracted Text: {data.get('extracted_text')}")
            
            if 'ai_analysis' in data:
                ai_analysis = data.get('ai_analysis')
                print(f"   🤖 AI Analysis:")
                print(f"      Document Type: {ai_analysis.get('document_type')}")
                print(f"      Confidence: {ai_analysis.get('confidence_score')}")
                print(f"      Key Findings: {ai_analysis.get('key_findings')}")
                print(f"      Recommendations: {ai_analysis.get('recommendations')}")
                
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("🧪 Testing AI Processing (No Database)")
    print("=" * 40)
    test_ai_processing()
    print("\n✅ Test completed!")