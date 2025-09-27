import requests

def test_document_upload():
    """Test document upload with actual file"""
    url = "http://localhost:8000/api/v1/documents/upload-simple"  # Use simple endpoint
    
    # Create a test image file content
    test_content = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\nIDATx\x9cc\xf8\x00\x00\x00\x01\x00\x01\x00\x00\x00\x00IEND\xaeB`\x82'
    
    files = {
        'file': ('test_medical_document.png', test_content, 'image/png')
    }
    
    data = {
        'document_type': 'medical_record'  # Use valid document type
    }
    
    try:
        print("🔍 Testing Document Upload...")
        response = requests.post(url, files=files, data=data)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Response: {result}")
            if result.get('success'):
                print("✅ Document upload is working!")
                return True
            else:
                print(f"❌ Upload failed: {result.get('message')}")
                return False
        else:
            print(f"❌ HTTP Error {response.status_code}")
            try:
                error_detail = response.json()
                print(f"Error details: {error_detail}")
            except:
                print(f"Response text: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Exception occurred: {e}")
        return False

if __name__ == "__main__":
    test_document_upload()