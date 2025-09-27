import requests
import json

def test_contact_support_detailed():
    """Detailed test of contact support functionality"""
    print("=== DEBUGGING CONTACT SUPPORT ===")
    
    # Test 1: Check if support page loads
    print("1. Testing Support Page Access...")
    try:
        response = requests.get('http://localhost:3000/support', timeout=10)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print("   ✅ Support page loads successfully")
        else:
            print(f"   ❌ Support page failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Error accessing support page: {e}")
        return False
    
    # Test 2: Check backend API
    print("\n2. Testing Backend API...")
    test_data = {
        "name": "Aryan",
        "email": "aryan@gmail.com",
        "subject": "Test Support Request",
        "message": "Testing if the contact API works",
        "category": "technical",
        "priority": "medium"
    }
    
    try:
        api_response = requests.post(
            'http://localhost:8000/api/v1/support/contact',
            json=test_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        print(f"   Status: {api_response.status_code}")
        print(f"   Response: {api_response.text}")
        
        if api_response.status_code == 200:
            data = api_response.json()
            print(f"   ✅ API working - Ticket ID: {data.get('ticket_id', 'N/A')}")
        else:
            print(f"   ⚠️  API returned {api_response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Error testing API: {e}")
    
    # Test 3: Check what might be wrong with frontend form
    print("\n3. Checking Frontend Form Issues...")
    print("   Common issues that could prevent form submission:")
    print("   - JavaScript errors in browser console")
    print("   - Form validation preventing submission")
    print("   - Missing required fields")
    print("   - Network connectivity issues")
    print("   - CORS issues between frontend and backend")
    
    print("\n4. Manual Testing Steps:")
    print("   1. Open browser to http://localhost:3000/support")
    print("   2. Open browser developer tools (F12)")
    print("   3. Go to Console tab to check for errors")
    print("   4. Fill out the contact form:")
    print("      - Name should be pre-filled with 'Aryan'")
    print("      - Email should be pre-filled with 'aryan@gmail.com'")
    print("      - Add Subject: 'Test Message'")
    print("      - Add Message: 'Testing contact form'")
    print("      - Select Category: 'Technical'")
    print("   5. Click 'Submit Request' button")
    print("   6. Check console for any error messages")
    print("   7. Look for success message with ticket ID")
    
    return True

def check_support_page_structure():
    """Check if the support page has the correct structure"""
    print("\n=== CHECKING SUPPORT PAGE STRUCTURE ===")
    
    try:
        response = requests.get('http://localhost:3000/support', timeout=10)
        if response.status_code == 200:
            content = response.text
            
            # Check for key elements
            has_form = 'onSubmit' in content or 'handleSubmit' in content
            has_name_field = 'name' in content
            has_email_field = 'email' in content
            has_submit_button = 'Submit Request' in content or 'submit' in content.lower()
            
            print(f"   Form found: {'✅' if has_form else '❌'}")
            print(f"   Name field: {'✅' if has_name_field else '❌'}")
            print(f"   Email field: {'✅' if has_email_field else '❌'}")
            print(f"   Submit button: {'✅' if has_submit_button else '❌'}")
            
            if all([has_form, has_name_field, has_email_field, has_submit_button]):
                print("   ✅ Page structure looks correct")
                return True
            else:
                print("   ❌ Page structure has issues")
                return False
        else:
            print(f"   ❌ Could not load page: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error checking page structure: {e}")
        return False

if __name__ == "__main__":
    print("🔍 CONTACT SUPPORT DEBUGGING")
    print("=" * 50)
    
    api_test = test_contact_support_detailed()
    structure_test = check_support_page_structure()
    
    print("\n" + "=" * 50)
    print("📊 DEBUGGING SUMMARY:")
    
    if api_test and structure_test:
        print("✅ Basic structure and API seem to be working")
        print("💡 Issue might be in browser JavaScript or form handling")
        print("\nNext steps:")
        print("1. Check browser console for JavaScript errors")
        print("2. Verify form fields are properly filled")
        print("3. Check network tab in developer tools")
    else:
        print("❌ Found structural or API issues")
        print("🔧 Need to investigate further")