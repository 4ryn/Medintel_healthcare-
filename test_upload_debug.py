#!/usr/bin/env python3
"""
Simple test to check what's happening with the OCR extraction
"""

import subprocess
import sys
import os

def test_ocr_extraction():
    """Test OCR extraction directly"""
    print("🔍 Testing OCR Extraction")
    print("=" * 50)
    
    # Check if mediations.jpg exists
    if not os.path.exists("mediations.jpg"):
        print("❌ mediations.jpg not found")
        return
    
    print("✅ mediations.jpg found")
    print(f"📏 File size: {os.path.getsize('mediations.jpg')} bytes")
    
    # Test with curl to see what the server logs
    try:
        print("\n🚀 Testing upload...")
        result = subprocess.run([
            "curl", "-X", "POST", 
            "http://localhost:8000/api/v1/documents/upload",
            "-H", "accept: application/json",
            "-H", "Content-Type: multipart/form-data",
            "-F", "file=@mediations.jpg",
            "-F", "document_type=lab_report",
            "-F", "description=Testing medication extraction",
            "-v"  # Verbose output
        ], capture_output=True, text=True, timeout=60)
        
        print("📤 CURL Response:")
        print(result.stdout)
        
        if result.stderr:
            print("📤 CURL Debug Info:")
            print(result.stderr)
            
    except subprocess.TimeoutExpired:
        print("⏰ Request timed out")
    except Exception as e:
        print(f"💥 Error: {e}")

if __name__ == "__main__":
    os.chdir(r"C:\Users\hp\Documents\GitHub\medintel-healthcare")
    test_ocr_extraction()