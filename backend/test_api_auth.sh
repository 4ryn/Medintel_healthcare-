#!/bin/bash
# API Authentication Endpoint Testing Script
# Tests the /api/v1/auth/token endpoint with demo credentials

set -e

echo "=================================================="
echo "🧪 MedIntel Healthcare - API Auth Endpoint Test"
echo "=================================================="
echo ""

# Configuration
BASE_URL="${API_BASE_URL:-http://127.0.0.1:8000}"
AUTH_ENDPOINT="$BASE_URL/api/v1/auth/token"

# Demo credentials
PATIENT_EMAIL="patient1@demo.com"
PATIENT_PASSWORD="password123"

echo "📍 Testing endpoint: $AUTH_ENDPOINT"
echo ""

# Function to test login
test_login() {
    local email=$1
    local password=$2
    local description=$3

    echo "🔐 Testing: $description"
    echo "   Email: $email"

    response=$(curl -s -w "\n%{http_code}" -X POST "$AUTH_ENDPOINT" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "username=$email&password=$password")

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    if [ "$http_code" = "200" ]; then
        echo "   ✅ Status: $http_code OK"

        # Check if response contains access_token
        if echo "$body" | grep -q "access_token"; then
            token=$(echo "$body" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
            token_type=$(echo "$body" | grep -o '"token_type":"[^"]*' | cut -d'"' -f4)
            echo "   ✅ Token received: ${token:0:20}..."
            echo "   ✅ Token type: $token_type"
            return 0
        else
            echo "   ❌ Response missing access_token"
            echo "   Response: $body"
            return 1
        fi
    else
        echo "   ❌ Status: $http_code"
        echo "   Response: $body"
        return 1
    fi
}

# Function to test wrong password
test_wrong_password() {
    local email=$1
    local wrong_password="wrongpassword123"

    echo "🔐 Testing: Wrong password (should fail)"
    echo "   Email: $email"

    response=$(curl -s -w "\n%{http_code}" -X POST "$AUTH_ENDPOINT" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "username=$email&password=$wrong_password")

    http_code=$(echo "$response" | tail -n1)

    if [ "$http_code" = "401" ]; then
        echo "   ✅ Status: $http_code Unauthorized (expected)"
        return 0
    else
        echo "   ❌ Unexpected status: $http_code (expected 401)"
        return 1
    fi
}

# Function to check server availability
check_server() {
    echo "🔍 Checking if server is running..."

    if curl -s "$BASE_URL/docs" > /dev/null 2>&1; then
        echo "   ✅ Server is running"
        return 0
    else
        echo "   ❌ Server not responding at $BASE_URL"
        echo ""
        echo "   Please start the server first:"
        echo "   cd backend && uvicorn main:app --reload"
        return 1
    fi
}

# Main test execution
main() {
    # Check if server is running
    if ! check_server; then
        exit 1
    fi

    echo ""
    echo "=================================================="
    echo "Running Authentication Tests"
    echo "=================================================="
    echo ""

    # Test 1: Valid credentials
    if test_login "$PATIENT_EMAIL" "$PATIENT_PASSWORD" "Demo patient account"; then
        TEST1_PASS=1
    else
        TEST1_PASS=0
    fi

    echo ""

    # Test 2: Wrong password
    if test_wrong_password "$PATIENT_EMAIL"; then
        TEST2_PASS=1
    else
        TEST2_PASS=0
    fi

    echo ""
    echo "=================================================="
    echo "📊 Test Results Summary"
    echo "=================================================="

    if [ $TEST1_PASS -eq 1 ]; then
        echo "✅ PASS - Valid credentials authentication"
    else
        echo "❌ FAIL - Valid credentials authentication"
    fi

    if [ $TEST2_PASS -eq 1 ]; then
        echo "✅ PASS - Wrong password rejection"
    else
        echo "❌ FAIL - Wrong password rejection"
    fi

    echo "=================================================="

    if [ $TEST1_PASS -eq 1 ] && [ $TEST2_PASS -eq 1 ]; then
        echo ""
        echo "🎉 All API authentication tests passed!"
        echo ""
        echo "The bcrypt password fix is working correctly."
        echo "You can now use the authentication endpoints."
        exit 0
    else
        echo ""
        echo "⚠️  Some tests failed. Please review the output above."
        exit 1
    fi
}

# Run main function
main
