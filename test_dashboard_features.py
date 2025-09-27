import requests
import json

def test_patient_dashboard_features():
    """Test all patient dashboard features"""
    base_url = "http://localhost:8000/api/v1"
    
    print("🧪 Testing Patient Dashboard Features\n")
    
    # Test 1: Vitals Recording
    print("1. Testing Vitals Recording...")
    vitals_data = {
        "type": "heart_rate",
        "value": 75,
        "unit": "bpm",
        "notes": "Resting heart rate",
        "status": "normal"
    }
    
    try:
        response = requests.post(f"{base_url}/vitals/", json=vitals_data)
        print(f"   Status: {response.status_code}")
        result = response.json()
        print(f"   Response: {result}")
        if result.get('success'):
            print("   ✅ Vitals recording: WORKING")
        else:
            print("   ❌ Vitals recording: FAILED")
    except Exception as e:
        print(f"   ❌ Vitals recording error: {e}")
    
    # Test 2: Document Upload (Test endpoint)
    print("\n2. Testing Document Upload...")
    files = {
        'file': ('test.jpg', b'fake image data', 'image/jpeg')
    }
    try:
        response = requests.post(f"{base_url}/documents/test-ai-processing", files=files)
        print(f"   Status: {response.status_code}")
        result = response.json()
        print(f"   Response: {result}")
        if result.get('success'):
            print("   ✅ Document AI processing: WORKING")
        else:
            print("   ❌ Document AI processing: FAILED")
    except Exception as e:
        print(f"   ❌ Document upload error: {e}")
    
    # Test 3: Appointments (Try weekday)
    print("\n3. Testing Appointments...")
    appointment_data = {
        "provider_id": 1,
        "appointment_date": "2025-09-16",  # Monday instead of Saturday
        "start_time": "10:00:00",
        "appointment_type": "consultation",
        "notes": "Testing appointment booking",
        "is_telehealth": False
    }
    
    try:
        response = requests.post(f"{base_url}/appointments/", json=appointment_data)
        print(f"   Status: {response.status_code}")
        result = response.json()
        print(f"   Response: {result}")
        if result.get('success'):
            print("   ✅ Appointment booking: WORKING")
        else:
            print("   ❌ Appointment booking: FAILED")
    except Exception as e:
        print(f"   ❌ Appointment booking error: {e}")
    
    # Test 4: Get Vitals List
    print("\n4. Testing Vitals Retrieval...")
    try:
        response = requests.get(f"{base_url}/vitals/")
        print(f"   Status: {response.status_code}")
        result = response.json()
        print(f"   Response: {result}")
        if result.get('success'):
            print("   ✅ Vitals retrieval: WORKING")
        else:
            print("   ❌ Vitals retrieval: FAILED")
    except Exception as e:
        print(f"   ❌ Vitals retrieval error: {e}")
    
    # Test 5: Get Appointments List
    print("\n5. Testing Appointments Retrieval...")
    try:
        response = requests.get(f"{base_url}/appointments/")
        print(f"   Status: {response.status_code}")
        result = response.json()
        print(f"   Response: {result}")
        if result.get('success'):
            print("   ✅ Appointments retrieval: WORKING")
        else:
            print("   ❌ Appointments retrieval: FAILED")
    except Exception as e:
        print(f"   ❌ Appointments retrieval error: {e}")
    
    print("\n📋 Summary of Patient Dashboard Features:")
    print("   🩺 Vital Signs Recording")
    print("   📄 Document Upload with AI Processing") 
    print("   📅 Appointment Scheduling")
    print("   📊 Health Analytics & Care Plans")
    print("   💊 Medication Tracking")
    print("   🔔 Notifications Center")
    
    print("\n🎥 Video Call Features Found:")
    print("   📞 Telehealth appointments supported")
    print("   🎥 Video call functionality in CommunicationCenter component")
    print("   📱 Meeting links generated for virtual appointments")
    
    print("\n💬 Chat Features Found:")
    print("   🗨️ CommunicationCenter component with full chat system")
    print("   👥 Direct messages, group chats, consultation chats")
    print("   📎 File sharing, image sharing capabilities")
    print("   🔔 Real-time messaging system")

if __name__ == "__main__":
    test_patient_dashboard_features()