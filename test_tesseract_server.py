#!/usr/bin/env python3
"""
Test Tesseract availability in current Python environment
"""
import subprocess
import sys
import os

def test_tesseract():
    print("🔍 Testing Tesseract OCR availability...")
    
    # Test 1: Check if tesseract command is available
    try:
        result = subprocess.run(['tesseract', '--version'], 
                              capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            print("✅ Tesseract command available via PATH")
            print(f"   Version: {result.stdout.split()[1] if result.stdout else 'Unknown'}")
        else:
            print("❌ Tesseract command not available via PATH")
    except Exception as e:
        print(f"❌ Tesseract command failed: {e}")
    
    # Test 2: Check if pytesseract can find tesseract
    try:
        import pytesseract
        print("✅ pytesseract module imported successfully")
        
        # Try to get tesseract version via pytesseract
        version = pytesseract.get_tesseract_version()
        print(f"✅ pytesseract can access Tesseract: {version}")
        
    except Exception as e:
        print(f"❌ pytesseract failed: {e}")
    
    # Test 3: Check PATH environment variable
    path_dirs = os.environ.get('PATH', '').split(os.pathsep)
    tesseract_in_path = any('tesseract' in path.lower() for path in path_dirs)
    if tesseract_in_path:
        print("✅ Tesseract directory found in PATH")
        for path in path_dirs:
            if 'tesseract' in path.lower():
                print(f"   Path: {path}")
    else:
        print("❌ Tesseract directory not found in PATH")
    
    # Test 4: Check specific Tesseract installation path
    tesseract_path = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    if os.path.exists(tesseract_path):
        print(f"✅ Tesseract executable found at: {tesseract_path}")
    else:
        print(f"❌ Tesseract executable not found at: {tesseract_path}")

if __name__ == "__main__":
    test_tesseract()