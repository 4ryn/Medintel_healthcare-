import requests
import json

def test_vitals_endpoint():
    """Test the vitals endpoint"""
    url = "http://localhost:8000/api/v1/vitals/"
    
    # Test data
    test_vital = {
        "type": "blood_pressure_systolic",
        "value": 120,
        "unit": "mmHg",
        "notes": "Test vital",
        "status": "normal"
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    try:
        print("Testing vitals endpoint...")
        response = requests.post(url, json=test_vital, headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            print("✅ Vitals endpoint is working!")
        else:
            print("❌ Vitals endpoint has issues")
            
    except Exception as e:
        print(f"❌ Error testing vitals endpoint: {e}")

if __name__ == "__main__":
    test_vitals_endpoint()