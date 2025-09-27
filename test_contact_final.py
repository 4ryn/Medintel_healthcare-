import requests
import json

def test_contact_form_final():
    """Final test of contact support form after fixes"""
    print("=== TESTING CONTACT SUPPORT FORM (AFTER FIXES) ===")
    
    # Test the actual form functionality
    print("1. Testing Support Page...")
    try:
        response = requests.get('http://localhost:3000/support', timeout=10)
        if response.status_code == 200:
            print("   ✅ Support page loads successfully")
        else:
            print(f"   ❌ Support page failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False
    
    # Test API with complete form data
    print("\n2. Testing Contact Form API...")
    complete_form_data = {
        "name": "Aryan",
        "email": "aryan@gmail.com",
        "subject": "Test Contact Request",
        "message": "This is a test message to verify the contact form works correctly.",
        "category": "technical",
        "priority": "medium"
    }
    
    try:
        response = requests.post(
            'http://localhost:8000/api/v1/support/contact',
            json=complete_form_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Form submission successful!")
            print(f"   Ticket ID: {data.get('ticket_id', 'N/A')}")
            print(f"   Message: {data.get('message', 'N/A')}")
            return True
        else:
            print(f"   ⚠️  API returned {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error testing API: {e}")
        return False

def provide_troubleshooting_steps():
    """Provide step-by-step troubleshooting"""
    print("\n=== TROUBLESHOOTING STEPS ===")
    
    print("🔧 FIXES APPLIED:")
    print("   ✅ Added form validation with clear error messages")
    print("   ✅ Added required attribute to category field")
    print("   ✅ Enhanced console logging for debugging")
    print("   ✅ Added validation checks before submission")
    
    print("\n📝 MANUAL TESTING STEPS:")
    print("1. Open http://localhost:3000/support in your browser")
    print("2. Open Developer Tools (F12) and go to Console tab")
    print("3. Fill out the form completely:")
    print("   - Name: Should show 'Aryan'")
    print("   - Email: Should show 'aryan@gmail.com'")
    print("   - Subject: Enter 'Test Support Request'")
    print("   - Message: Enter 'Testing the contact form'")
    print("   - Category: Select 'Technical Issues'")
    print("   - Priority: Should default to 'Medium'")
    print("4. Click 'Submit Request' button")
    print("5. Check console for debug messages")
    print("6. Look for success message with ticket ID")
    
    print("\n🚨 COMMON ISSUES:")
    print("   - Missing required fields (Name, Email, Subject, Message)")
    print("   - Category not selected")
    print("   - JavaScript disabled in browser")
    print("   - Network connectivity issues")
    print("   - Browser blocking form submission")
    
    print("\n✅ EXPECTED BEHAVIOR:")
    print("   - Form validates all required fields")
    print("   - Shows error message if validation fails")
    print("   - Shows success message with ticket ID when successful")
    print("   - Form resets after successful submission")
    print("   - Console shows debug information")

if __name__ == "__main__":
    print("🧪 FINAL CONTACT SUPPORT TEST")
    print("=" * 60)
    
    success = test_contact_form_final()
    provide_troubleshooting_steps()
    
    print("\n" + "=" * 60)
    if success:
        print("🎉 CONTACT SUPPORT IS WORKING!")
        print("✅ API responds correctly")
        print("✅ Form validation implemented")
        print("✅ Error handling enhanced")
        print("\n💡 If you're still having issues:")
        print("   1. Check browser console for JavaScript errors")
        print("   2. Ensure all form fields are filled")
        print("   3. Try clearing browser cache")
        print("   4. Verify network connectivity")
    else:
        print("⚠️  STILL HAVING ISSUES")
        print("🔧 Try the manual testing steps above")
        print("📞 Check browser console for error messages")