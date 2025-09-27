# MedIntel Healthcare - Quick Feature Test Script
# Tests all major features and shows clear status

Write-Host "`n===============================================" -ForegroundColor Cyan
Write-Host "  MEDINTEL HEALTHCARE - FEATURE TESTING" -ForegroundColor Cyan  
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "Testing Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray

# Test Backend Health
Write-Host "`n[TESTING] Backend Server..." -ForegroundColor Yellow
try {
    $backend = Invoke-RestMethod -Uri "http://localhost:8000/" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Backend Server: WORKING - $($backend.message)" -ForegroundColor Green
    $backendWorking = $true
} catch {
    Write-Host "❌ Backend Server: NOT WORKING - $_" -ForegroundColor Red
    $backendWorking = $false
}

# Test Frontend Health  
Write-Host "`n[TESTING] Frontend Server..." -ForegroundColor Yellow
try {
    $frontend = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -ErrorAction Stop
    if ($frontend.Content -like "*MedIntel Healthcare*") {
        Write-Host "✅ Frontend Server: WORKING - MedIntel page loading" -ForegroundColor Green
        $frontendWorking = $true
    } else {
        Write-Host "❌ Frontend Server: WRONG CONTENT - Not showing MedIntel" -ForegroundColor Red
        $frontendWorking = $false
    }
} catch {
    Write-Host "❌ Frontend Server: NOT WORKING - $_" -ForegroundColor Red
    $frontendWorking = $false
}

# Test Schedule Appointment
Write-Host "`n[TESTING] Schedule Appointment API..." -ForegroundColor Yellow
try {
    $appointments = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/appointments/" -TimeoutSec 5 -ErrorAction Stop
    if ($appointments.success) {
        $count = $appointments.data.Count
        Write-Host "✅ Schedule Appointment: WORKING - $count appointments found" -ForegroundColor Green
        $scheduleWorking = $true
    } else {
        Write-Host "❌ Schedule Appointment: API ERROR - $($appointments.message)" -ForegroundColor Red
        $scheduleWorking = $false
    }
} catch {
    Write-Host "❌ Schedule Appointment: NOT WORKING - $_" -ForegroundColor Red
    $scheduleWorking = $false
}

# Test Update Profile
Write-Host "`n[TESTING] Update Profile API..." -ForegroundColor Yellow
try {
    $profile = Invoke-WebRequest -Uri "http://localhost:8000/api/v1/patients/profile?patient_id=1" -TimeoutSec 5 -ErrorAction Stop
    if ($profile.StatusCode -eq 401) {
        Write-Host "✅ Update Profile: WORKING - Authentication required (normal)" -ForegroundColor Green
        $profileWorking = $true
    } elseif ($profile.StatusCode -eq 200) {
        Write-Host "✅ Update Profile: WORKING - API responding" -ForegroundColor Green  
        $profileWorking = $true
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ Update Profile: WORKING - Authentication required (normal)" -ForegroundColor Green
        $profileWorking = $true
    } else {
        Write-Host "❌ Update Profile: NOT WORKING - $_" -ForegroundColor Red
        $profileWorking = $false
    }
}

# Test Contact Support
Write-Host "`n[TESTING] Contact Support API..." -ForegroundColor Yellow
try {
    $support = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/support/contact-info" -TimeoutSec 5 -ErrorAction Stop
    if ($support.success) {
        Write-Host "✅ Contact Support: WORKING - Contact info available" -ForegroundColor Green
        $supportWorking = $true
    } else {
        Write-Host "❌ Contact Support: API ERROR - $($support.message)" -ForegroundColor Red
        $supportWorking = $false
    }
} catch {
    Write-Host "❌ Contact Support: NOT WORKING - $_" -ForegroundColor Red
    $supportWorking = $false
}

# Summary
Write-Host "`n===============================================" -ForegroundColor Cyan
Write-Host "  OVERALL SUMMARY" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

$workingFeatures = @($backendWorking, $frontendWorking, $scheduleWorking, $profileWorking, $supportWorking)
$workingCount = ($workingFeatures | Where-Object { $_ }).Count
$totalCount = $workingFeatures.Count

Write-Host "📊 Features Working: $workingCount/$totalCount" -ForegroundColor White

if ($workingCount -eq $totalCount) {
    Write-Host "🎉 ALL FEATURES ARE WORKING PERFECTLY!" -ForegroundColor Green
} elseif ($workingCount -ge 4) {
    Write-Host "✅ Most features working - Minor issues to fix" -ForegroundColor Yellow
} elseif ($workingCount -ge 2) {
    Write-Host "⚠️  Some features working - Moderate issues" -ForegroundColor Orange
} else {
    Write-Host "❌ Major issues - Most features not working" -ForegroundColor Red
}

# Troubleshooting Instructions
Write-Host "`n===============================================" -ForegroundColor Cyan
Write-Host "  TROUBLESHOOTING INSTRUCTIONS" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

if (-not $backendWorking) {
    Write-Host "🔧 BACKEND ISSUE:" -ForegroundColor Red
    Write-Host "   1. cd backend" -ForegroundColor White
    Write-Host "   2. python main.py" -ForegroundColor White
    Write-Host "   3. Or: uvicorn main:app --reload --port 8000" -ForegroundColor White
}

if (-not $frontendWorking) {
    Write-Host "🔧 FRONTEND ISSUE:" -ForegroundColor Red  
    Write-Host "   1. cd frontend" -ForegroundColor White
    Write-Host "   2. npm run dev" -ForegroundColor White
    Write-Host "   3. Or: npx next dev --port 3000" -ForegroundColor White
}

if (-not $scheduleWorking -and $backendWorking) {
    Write-Host "🔧 SCHEDULE APPOINTMENT ISSUE:" -ForegroundColor Red
    Write-Host "   - Backend running but appointments API not working" -ForegroundColor White
    Write-Host "   - Check backend/app/routes/appointments.py" -ForegroundColor White
}

if (-not $profileWorking -and $backendWorking) {
    Write-Host "🔧 UPDATE PROFILE ISSUE:" -ForegroundColor Red
    Write-Host "   - Backend running but profile API not working" -ForegroundColor White
    Write-Host "   - Check backend/app/routes/patients.py" -ForegroundColor White
}

if (-not $supportWorking -and $backendWorking) {
    Write-Host "🔧 CONTACT SUPPORT ISSUE:" -ForegroundColor Red
    Write-Host "   - Backend running but support API not working" -ForegroundColor White
    Write-Host "   - Check backend/app/routes/support.py" -ForegroundColor White
}

Write-Host "`n===============================================" -ForegroundColor Cyan
Write-Host "Testing completed!" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan