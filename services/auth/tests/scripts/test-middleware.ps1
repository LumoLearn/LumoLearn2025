# PowerShell test script za BE-003 JWT Middleware
# Usage: .\test-middleware.ps1

Write-Host "`n🧪 Testing JWT Authentication Middleware (Task BE-003)`n" -ForegroundColor Cyan
Write-Host "━" * 80 -ForegroundColor Gray

# Check if auth service is running
Write-Host "`n📡 Checking if auth service is running..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3001/health" -Method Get -ErrorAction Stop
    Write-Host "✅ Auth service is running: $($health.service)" -ForegroundColor Green
} catch {
    Write-Host "❌ Auth service is NOT running!" -ForegroundColor Red
    Write-Host "Please start it with: npm run dev" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n━" * 80 -ForegroundColor Gray

# Generate test tokens
Write-Host "`n🔑 Generating test tokens..." -ForegroundColor Yellow

$env:JWT_SECRET = "dev-secret-key-for-testing-only-change-in-production"

# Generate student token
Write-Host "`nGenerating STUDENT token..." -ForegroundColor Cyan
$studentToken = node src/utils/generateTestToken.js student 2>&1 | Select-String -Pattern "eyJ" | ForEach-Object { $_.Line.Trim() }

# Generate teacher token
Write-Host "Generating TEACHER token..." -ForegroundColor Cyan
$teacherToken = node src/utils/generateTestToken.js teacher 2>&1 | Select-String -Pattern "eyJ" | ForEach-Object { $_.Line.Trim() }

# Generate parent token
Write-Host "Generating PARENT token..." -ForegroundColor Cyan
$parentToken = node src/utils/generateTestToken.js parent 2>&1 | Select-String -Pattern "eyJ" | ForEach-Object { $_.Line.Trim() }

Write-Host "`n✅ Tokens generated successfully!" -ForegroundColor Green

Write-Host "`n━" * 80 -ForegroundColor Gray
Write-Host "`n🧪 Running Test Cases..." -ForegroundColor Yellow
Write-Host "`n━" * 80 -ForegroundColor Gray

$passed = 0
$failed = 0

# Test 1: Valid Token
Write-Host "`n[Test 1/9] Valid Token (Student)" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/test/profile" `
        -Method Get `
        -Headers @{ "Authorization" = "Bearer $studentToken" } `
        -ErrorAction Stop
    
    if ($response.success -eq $true -and $response.user.role -eq "student") {
        Write-Host "✅ PASS - Valid token accepted" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "❌ FAIL - Unexpected response" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 2: Missing Token
Write-Host "`n[Test 2/9] Missing Token" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/test/profile" `
        -Method Get `
        -ErrorAction Stop
    
    Write-Host "❌ FAIL - Should have been rejected" -ForegroundColor Red
    $failed++
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ PASS - Missing token rejected (401)" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "❌ FAIL - Wrong status code" -ForegroundColor Red
        $failed++
    }
}

# Test 3: Invalid Token
Write-Host "`n[Test 3/9] Invalid Token" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/test/profile" `
        -Method Get `
        -Headers @{ "Authorization" = "Bearer invalid-token-123" } `
        -ErrorAction Stop
    
    Write-Host "❌ FAIL - Invalid token should be rejected" -ForegroundColor Red
    $failed++
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ PASS - Invalid token rejected (401)" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "❌ FAIL - Wrong status code" -ForegroundColor Red
        $failed++
    }
}

# Test 4: Teacher-only route with Student token
Write-Host "`n[Test 4/9] Teacher-only Route (Student trying)" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/test/teacher-only" `
        -Method Get `
        -Headers @{ "Authorization" = "Bearer $studentToken" } `
        -ErrorAction Stop
    
    Write-Host "❌ FAIL - Student should be rejected" -ForegroundColor Red
    $failed++
} catch {
    if ($_.Exception.Response.StatusCode -eq 403) {
        Write-Host "✅ PASS - Student rejected from teacher route (403)" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "❌ FAIL - Wrong status code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        $failed++
    }
}

# Test 5: Teacher-only route with Teacher token
Write-Host "`n[Test 5/9] Teacher-only Route (Teacher trying)" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/test/teacher-only" `
        -Method Get `
        -Headers @{ "Authorization" = "Bearer $teacherToken" } `
        -ErrorAction Stop
    
    if ($response.success -eq $true -and $response.user.role -eq "teacher") {
        Write-Host "✅ PASS - Teacher accessed teacher route" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "❌ FAIL - Unexpected response" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 6: Multi-role route with Student token
Write-Host "`n[Test 6/9] Teacher/Parent Route (Student trying)" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/test/teacher-or-parent" `
        -Method Get `
        -Headers @{ "Authorization" = "Bearer $studentToken" } `
        -ErrorAction Stop
    
    Write-Host "❌ FAIL - Student should be rejected" -ForegroundColor Red
    $failed++
} catch {
    if ($_.Exception.Response.StatusCode -eq 403) {
        Write-Host "✅ PASS - Student rejected from teacher/parent route (403)" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "❌ FAIL - Wrong status code" -ForegroundColor Red
        $failed++
    }
}

# Test 7: Multi-role route with Parent token
Write-Host "`n[Test 7/9] Teacher/Parent Route (Parent trying)" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/test/teacher-or-parent" `
        -Method Get `
        -Headers @{ "Authorization" = "Bearer $parentToken" } `
        -ErrorAction Stop
    
    if ($response.success -eq $true -and $response.user.role -eq "parent") {
        Write-Host "✅ PASS - Parent accessed teacher/parent route" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "❌ FAIL - Unexpected response" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 8: Dashboard with Student token
Write-Host "`n[Test 8/9] Dashboard (Student)" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/test/dashboard" `
        -Method Get `
        -Headers @{ "Authorization" = "Bearer $studentToken" } `
        -ErrorAction Stop
    
    if ($response.success -eq $true) {
        Write-Host "✅ PASS - Student accessed dashboard" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "❌ FAIL - Unexpected response" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Test 9: Dashboard with Teacher token
Write-Host "`n[Test 9/9] Dashboard (Teacher)" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/test/dashboard" `
        -Method Get `
        -Headers @{ "Authorization" = "Bearer $teacherToken" } `
        -ErrorAction Stop
    
    if ($response.success -eq $true) {
        Write-Host "✅ PASS - Teacher accessed dashboard" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "❌ FAIL - Unexpected response" -ForegroundColor Red
        $failed++
    }
} catch {
    Write-Host "❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
    $failed++
}

# Summary
Write-Host "`n━" * 80 -ForegroundColor Gray
Write-Host "`n📊 Test Results Summary" -ForegroundColor Yellow
Write-Host "`n━" * 80 -ForegroundColor Gray
Write-Host "`nTotal Tests: 9" -ForegroundColor White
Write-Host "✅ Passed: $passed" -ForegroundColor Green
Write-Host "❌ Failed: $failed" -ForegroundColor Red
Write-Host "`nSuccess Rate: $([math]::Round(($passed / 9) * 100, 2))%" -ForegroundColor $(if ($passed -eq 9) { "Green" } else { "Yellow" })

if ($passed -eq 9) {
    Write-Host "`n🎉 ALL TESTS PASSED! Task BE-003 is complete!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Some tests failed. Please review the errors above." -ForegroundColor Yellow
}

Write-Host "`n━" * 80 -ForegroundColor Gray
Write-Host ""

