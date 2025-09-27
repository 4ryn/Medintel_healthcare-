#!/usr/bin/env python3
"""
Test JSON cleaning with the exact problematic LLM response
"""

import re
import json

def test_comment_removal():
    """Test comment removal on the actual problematic response"""
    
    # This is the actual problematic LLM response
    problematic_json = """{
    "medications": [
        {
            "name": "Atorvastatin",
            "dosage": "unknown", // Interpreted from Ateneric (generic name for Atorvastatin)
            "frequency": "unknown", // Interpreted from Ateneric (generic name for Atorvastatin)
            "route": "oral", // Assuming all medications are oral unless specified otherwise
            "status": "current" // Assuming all medications are current unless discontinued is mentioned in the text.
        },
        {
            "name": "Glibenclamide", // Interpreted from Gleiazide (brand name for Glibenclamide) and Glimepiride (similar medication)
            "dosage": "unknown", // Interpreted from Gleiazide and Glimepiride dosage is not specified in the text.
            "frequency": "unknown", // Interpreted from Gleiazide and Glimepiride frequency is not specified in the text.
            "route": "oral", // Assuming all medications are oral unless specified otherwise.
            "status": "current" // Assuming all medications are current unless discontinued is mentioned in the text.
        }
    ]
}"""

    print("🔍 Testing Comment Removal on Problematic JSON")
    print("=" * 60)
    
    print("📄 Original (with comments):")
    print(problematic_json[:200] + "...")
    
    # Test 1: Current method
    print("\n🧹 Method 1: Current regex")
    cleaned1 = re.sub(r'\s*//[^\n]*', '', problematic_json)
    print(cleaned1[:200] + "...")
    
    try:
        parsed1 = json.loads(cleaned1)
        medications1 = parsed1.get('medications', [])
        print(f"✅ Method 1 SUCCESS: {len(medications1)} medications")
        for i, med in enumerate(medications1, 1):
            print(f"  {i}. {med.get('name', 'Unknown')}")
    except json.JSONDecodeError as e:
        print(f"❌ Method 1 FAILED: {e}")
    
    # Test 2: More aggressive
    print("\n🧹 Method 2: More aggressive cleaning")
    cleaned2 = problematic_json
    # Remove inline comments
    cleaned2 = re.sub(r'\s*//.*$', '', cleaned2, flags=re.MULTILINE)
    # Remove trailing commas
    cleaned2 = re.sub(r',(\s*[}\]])', r'\1', cleaned2)
    
    print(cleaned2[:200] + "...")
    
    try:
        parsed2 = json.loads(cleaned2)
        medications2 = parsed2.get('medications', [])
        print(f"✅ Method 2 SUCCESS: {len(medications2)} medications")
        for i, med in enumerate(medications2, 1):
            print(f"  {i}. {med.get('name', 'Unknown')}")
    except json.JSONDecodeError as e:
        print(f"❌ Method 2 FAILED: {e}")

if __name__ == "__main__":
    test_comment_removal()