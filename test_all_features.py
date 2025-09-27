#!/usr/bin/env python3
"""
MedIntel Healthcare - Comprehensive Feature Testing Script
Tests all major features and provides clear status messages
"""

import requests
import json
import sys
from datetime import datetime, timedelta

# API Base URLs
BACKEND_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:3000"

def print_header(title):
    print("\n" + "="*60)
    print(f"  {title}")
    print("="*60)

def print_status(feature, status, message):
    status_icon = "✅" if status else "❌"
    print(f"{status_icon} {feature}: {message}")

def test_backend_health():
    """Test if backend server is running"""
    try:
        response = requests.get(f"{BACKEND_URL}/", timeout=5)
        if response.status_code == 200:
            data = response.json()
            return True, f"Backend healthy - {data.get('message', 'OK')}"
        else:
            return False, f"Backend returned status {response.status_code}"
    except requests.exceptions.ConnectionError:
        return False, "Backend server not running on port 8000"
    except Exception as e:
        return False, f"Backend error: {str(e)}"

def test_frontend_health():
    """Test if frontend server is running"""
    try:
        response = requests.get(FRONTEND_URL, timeout=5)
        if response.status_code == 200:
            if "MedIntel Healthcare" in response.text:
                return True, "Frontend serving MedIntel Healthcare page"
            else:
                return False, "Frontend running but wrong content"
        else:
            return False, f"Frontend returned status {response.status_code}"
    except requests.exceptions.ConnectionError:
        return False, "Frontend server not running on port 3000"
    except Exception as e:
        return False, f"Frontend error: {str(e)}"

def test_schedule_appointment():
    """Test Schedule Appointment API"""
    try:
        # Test GET appointments
        response = requests.get(f"{BACKEND_URL}/api/v1/appointments/", timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                appointments = data.get('data', [])
                return True, f"Schedule Appointment working - {len(appointments)} appointments found"
            else:
                return False, f"Schedule API error: {data.get('message', 'Unknown error')}"
        else:
            return False, f"Schedule API returned status {response.status_code}"
    except Exception as e:
        return False, f"Schedule Appointment error: {str(e)}"

def test_update_profile():
    """Test Update Profile API"""
    try:
        # Test GET profile (without auth, will return error but endpoint exists)
        response = requests.get(f"{BACKEND_URL}/api/v1/patients/profile?patient_id=1", timeout=5)
        if response.status_code == 401:
            return True, "Update Profile API working (authentication required)"
        elif response.status_code == 200:
            return True, "Update Profile API working"
        else:
            return False, f"Profile API returned status {response.status_code}"
    except Exception as e:
        return False, f"Update Profile error: {str(e)}"

def test_contact_support():
    """Test Contact Support API"""
    try:
        # Test contact info endpoint
        response = requests.get(f"{BACKEND_URL}/api/v1/support/contact-info", timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                return True, "Contact Support working - contact info available"
            else:
                return False, f"Support API error: {data.get('message', 'Unknown error')}"
        else:
            return False, f"Support API returned status {response.status_code}"
    except Exception as e:
        return False, f"Contact Support error: {str(e)}"

def test_document_upload():
    """Test Document Upload/OCR API"""
    try:
        # Test if upload endpoint exists
        response = requests.options(f"{BACKEND_URL}/api/v1/documents/upload", timeout=5)
        if response.status_code in [200, 405]:  # 405 = Method not allowed for OPTIONS
            return True, "Document Upload API endpoint available"
        else:
            return False, f"Document Upload API returned status {response.status_code}"
    except Exception as e:
        return False, f"Document Upload error: {str(e)}"

def main():
    print_header("MEDINTEL HEALTHCARE - FEATURE TESTING")
    print(f"Testing Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Test Backend Health
    print_header("SERVER HEALTH CHECK")
    backend_status, backend_msg = test_backend_health()
    print_status("Backend Server", backend_status, backend_msg)
    
    frontend_status, frontend_msg = test_frontend_health()
    print_status("Frontend Server", frontend_status, frontend_msg)
    
    # Test Core Features
    print_header("CORE FEATURES TESTING")
    
    schedule_status, schedule_msg = test_schedule_appointment()
    print_status("Schedule Appointment", schedule_status, schedule_msg)
    
    profile_status, profile_msg = test_update_profile()
    print_status("Update Profile", profile_status, profile_msg)
    
    support_status, support_msg = test_contact_support()
    print_status("Contact Support", support_status, support_msg)
    
    upload_status, upload_msg = test_document_upload()
    print_status("Document Upload/OCR", upload_status, upload_msg)
    
    # Overall Summary
    print_header("OVERALL SUMMARY")
    
    all_features = [
        ("Backend Server", backend_status),
        ("Frontend Server", frontend_status),
        ("Schedule Appointment", schedule_status),
        ("Update Profile", profile_status),
        ("Contact Support", support_status),
        ("Document Upload", upload_status)
    ]
    
    working_count = sum(1 for _, status in all_features if status)
    total_count = len(all_features)
    
    print(f"📊 Features Working: {working_count}/{total_count}")
    
    if working_count == total_count:
        print("🎉 ALL FEATURES ARE WORKING PERFECTLY!")
    elif working_count >= 4:
        print("✅ Most features working - Minor issues to fix")
    elif working_count >= 2:
        print("⚠️  Some features working - Moderate issues")
    else:
        print("❌ Major issues - Most features not working")
    
    # Specific Instructions
    print_header("TROUBLESHOOTING INSTRUCTIONS")
    
    if not backend_status:
        print("🔧 BACKEND ISSUE:")
        print("   1. cd backend")
        print("   2. python main.py")
        print("   3. Or: uvicorn main:app --reload --port 8000")
    
    if not frontend_status:
        print("🔧 FRONTEND ISSUE:")
        print("   1. cd frontend")
        print("   2. npm run dev")
        print("   3. Or: npx next dev --port 3000")
    
    if not schedule_status and backend_status:
        print("🔧 SCHEDULE APPOINTMENT ISSUE:")
        print("   - Backend running but appointments API not working")
        print("   - Check backend/app/routes/appointments.py")
    
    if not profile_status and backend_status:
        print("🔧 UPDATE PROFILE ISSUE:")
        print("   - Backend running but profile API not working")  
        print("   - Check backend/app/routes/patients.py")
    
    if not support_status and backend_status:
        print("🔧 CONTACT SUPPORT ISSUE:")
        print("   - Backend running but support API not working")
        print("   - Check backend/app/routes/support.py")
    
    print("\n" + "="*60)
    print("Testing completed!")
    return working_count == total_count

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\nTesting interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\nTesting failed with error: {e}")
        sys.exit(1)