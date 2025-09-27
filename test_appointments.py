#!/usr/bin/env python3
"""
Test the fixed appointments endpoint with correct field format
"""
import requests
from datetime import date, time

BASE_URL = "http://localhost:8000/api/v1"

def test_appointments_fixed():
    """Test appointments endpoints with correct format"""
    print("📅 Testing Fixed Appointments Endpoints")
    print("-" * 40)
    
    # Test GET appointments
    try:
        response = requests.get(f"{BASE_URL}/appointments/")
        print(f"GET /appointments/ - Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ Success: {result.get('success')}")
            print(f"   📋 Appointments: {len(result.get('data', []))}")
        else:
            print(f"   ❌ Error: {response.text}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test POST appointments with correct format
    try:
        appointment_data = {
            "provider_id": 1,
            "appointment_date": "2025-01-20",
            "start_time": "10:00:00",
            "appointment_type": "consultation",
            "notes": "Test appointment - API verification",
            "is_telehealth": False
        }
        response = requests.post(f"{BASE_URL}/appointments/", json=appointment_data)
        print(f"POST /appointments/ - Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ Success: {result.get('success')}")
            print(f"   📅 Created: {result.get('data', {}).get('provider_name')}")
            print(f"   🕙 Time: {result.get('data', {}).get('start_time')}")
        else:
            print(f"   ❌ Error: {response.text}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print("\n✅ Appointments test completed!")

if __name__ == "__main__":
    test_appointments_fixed()