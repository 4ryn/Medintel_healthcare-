#!/usr/bin/env python3
"""
Debug JSON parsing issues for medication extraction
"""

import json
import re

def test_json_cleaning():
    """Test the JSON cleaning function that's causing issues"""
    
    # Simulated problematic LLM response
    test_response = """{
    "medications": [
        {
            "name": "Gliclazide",
            "dosage": null,
            "frequency": null,
            "route": null,
            "status": null
        },
        {
            "name": "Glimepiride", // This is a comment that might break parsing
            "dosage": null,
            "frequency": null,
            "route": null,
            "status": null
        },
        {
            "name": "Glyburide",
            "dosage": null,
            "frequency": null,
            "route": null,
            "status": null
        }
    ],
    "document_info": {
        "report_type": "Medication List"
    }
}"""

    print("🔍 Testing JSON Cleaning")
    print("=" * 50)
    
    # Test 1: Original response
    print("📄 Original Response:")
    print(test_response[:200] + "...")
    
    # Test 2: Remove comments
    cleaned = re.sub(r'\s*//.*?(?=\n|$)', '', test_response)
    print("\n🧹 After comment removal:")
    print(cleaned[:200] + "...")
    
    # Test 3: Try to parse
    try:
        parsed = json.loads(cleaned)
        medications = parsed.get('medications', [])
        print(f"\n✅ JSON parsing SUCCESS!")
        print(f"💊 Medications found: {len(medications)}")
        for i, med in enumerate(medications, 1):
            print(f"  {i}. {med.get('name', 'Unknown')}")
    except json.JSONDecodeError as e:
        print(f"\n❌ JSON parsing FAILED: {e}")
        
    # Test 4: More aggressive cleaning
    print(f"\n🔧 Trying more aggressive cleaning...")
    try:
        # Remove all comments and extra whitespace
        cleaned2 = re.sub(r'//.*?\n', '\n', test_response)
        cleaned2 = re.sub(r'/\*.*?\*/', '', cleaned2, flags=re.DOTALL)
        
        parsed2 = json.loads(cleaned2)
        medications2 = parsed2.get('medications', [])
        print(f"✅ Aggressive cleaning SUCCESS!")
        print(f"💊 Medications found: {len(medications2)}")
        
    except json.JSONDecodeError as e:
        print(f"❌ Aggressive cleaning FAILED: {e}")

if __name__ == "__main__":
    test_json_cleaning()