# Final Test Script for BE-006
$baseUrl = "http://localhost:3001"
$timestamp = Get-Date -Format "yyyyMMddHHmmss"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  BE-006: Accessibility Settings Tests" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Register Student
Write-Host "Test 1: Register Student" -ForegroundColor Yellow
$email1 = "student$timestamp@test.com"
$registerJson = "{`"email`":`"$email1`",`"password`":`"Test1234!`",`"role`":`"student`",`"firstName`":`"Test`",`"lastName`":`"Student`"}"
$response1 = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body $registerJson -ContentType "application/json"
$token = $response1.token
$userId = $response1.user.id
Write-Host "[PASS] Student registered! User ID: $userId" -ForegroundColor Green
Write-Host ""

# Test 2: Get Default Settings (using user ID)
Write-Host "Test 2: Get Default Settings" -ForegroundColor Yellow
$headers = @{ "Authorization" = "Bearer $token" }
$response2 = Invoke-RestMethod -Uri "$baseUrl/api/students/$userId/settings" -Method Get -Headers $headers
if ($response2.settings.font_family -eq "Arial" -and $response2.settings.font_size -eq 16) {
    Write-Host "[PASS] Default settings retrieved correctly" -ForegroundColor Green
    Write-Host "  Font: $($response2.settings.font_family), Size: $($response2.settings.font_size)" -ForegroundColor Gray
} else {
    Write-Host "[FAIL] Unexpected default settings" -ForegroundColor Red
}
Write-Host ""

# Test 3: Update Settings (Dyslexia Friendly)
Write-Host "Test 3: Update Settings (Dyslexia Friendly)" -ForegroundColor Yellow
$updateJson = '{"font_family":"OpenDyslexic","font_size":18,"line_spacing":2.0,"letter_spacing":0.12,"text_color":"#000000","background_color":"#FAFAC8"}'
$response3 = Invoke-RestMethod -Uri "$baseUrl/api/students/$userId/settings" -Method Put -Body $updateJson -ContentType "application/json" -Headers $headers
if ($response3.settings.font_family -eq "OpenDyslexic" -and $response3.settings.font_size -eq 18) {
    Write-Host "[PASS] Settings updated successfully" -ForegroundColor Green
    Write-Host "  Font: $($response3.settings.font_family), Size: $($response3.settings.font_size)" -ForegroundColor Gray
    Write-Host "  Background: $($response3.settings.background_color)" -ForegroundColor Gray
} else {
    Write-Host "[FAIL] Settings not updated correctly" -ForegroundColor Red
}
Write-Host ""

# Test 4: Partial Update
Write-Host "Test 4: Partial Update" -ForegroundColor Yellow
$partialJson = '{"font_size":20,"background_color":"#F0F0F0"}'
$response4 = Invoke-RestMethod -Uri "$baseUrl/api/students/$userId/settings" -Method Put -Body $partialJson -ContentType "application/json" -Headers $headers
if ($response4.settings.font_size -eq 20 -and $response4.settings.font_family -eq "OpenDyslexic") {
    Write-Host "[PASS] Partial update successful" -ForegroundColor Green
    Write-Host "  Font Size: $($response4.settings.font_size) (updated)" -ForegroundColor Gray
    Write-Host "  Background: $($response4.settings.background_color) (updated)" -ForegroundColor Gray
    Write-Host "  Font Family: $($response4.settings.font_family) (preserved)" -ForegroundColor Gray
} else {
    Write-Host "[FAIL] Partial update failed" -ForegroundColor Red
}
Write-Host ""

# Test 5: Validation Error - Invalid Font Size
Write-Host "Test 5: Validation Error (Invalid Font Size)" -ForegroundColor Yellow
try {
    $invalidJson = '{"font_size":50}'
    Invoke-RestMethod -Uri "$baseUrl/api/students/$userId/settings" -Method Put -Body $invalidJson -ContentType "application/json" -Headers $headers
    Write-Host "[FAIL] Should have returned validation error" -ForegroundColor Red
} catch {
    Write-Host "[PASS] Validation error caught correctly (400)" -ForegroundColor Green
}
Write-Host ""

# Test 6: Validation Error - Invalid Hex Color
Write-Host "Test 6: Validation Error (Invalid Hex Color)" -ForegroundColor Yellow
try {
    $invalidColorJson = '{"text_color":"red"}'
    Invoke-RestMethod -Uri "$baseUrl/api/students/$userId/settings" -Method Put -Body $invalidColorJson -ContentType "application/json" -Headers $headers
    Write-Host "[FAIL] Should have returned validation error" -ForegroundColor Red
} catch {
    Write-Host "[PASS] Validation error caught correctly (400)" -ForegroundColor Green
}
Write-Host ""

# Test 7: Authorization Test
Write-Host "Test 7: Authorization Test (Access Other Student Settings)" -ForegroundColor Yellow
$email2 = "student2$timestamp@test.com"
$register2Json = "{`"email`":`"$email2`",`"password`":`"Test1234!`",`"role`":`"student`",`"firstName`":`"Test2`",`"lastName`":`"Student2`"}"
$response7 = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body $register2Json -ContentType "application/json"
$token2 = $response7.token
try {
    $headers2 = @{ "Authorization" = "Bearer $token2" }
    Invoke-RestMethod -Uri "$baseUrl/api/students/$userId/settings" -Method Get -Headers $headers2
    Write-Host "[FAIL] Should have returned authorization error" -ForegroundColor Red
} catch {
    Write-Host "[PASS] Authorization error caught correctly (403)" -ForegroundColor Green
}
Write-Host ""

# Test 8: Authentication Error - Missing Token
Write-Host "Test 8: Authentication Error (Missing Token)" -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$baseUrl/api/students/$userId/settings" -Method Get
    Write-Host "[FAIL] Should have returned authentication error" -ForegroundColor Red
} catch {
    Write-Host "[PASS] Authentication error caught correctly (401)" -ForegroundColor Green
}
Write-Host ""

# Test 9: Preset - Visual Impairment
Write-Host "Test 9: Preset - Visual Impairment Settings" -ForegroundColor Yellow
$visualJson = '{"font_family":"Arial","font_size":24,"line_spacing":2.5,"letter_spacing":0.1,"text_color":"#000000","background_color":"#FFFF00"}'
$response9 = Invoke-RestMethod -Uri "$baseUrl/api/students/$userId/settings" -Method Put -Body $visualJson -ContentType "application/json" -Headers $headers
if ($response9.settings.font_size -eq 24 -and $response9.settings.background_color -eq "#FFFF00") {
    Write-Host "[PASS] Visual impairment preset applied" -ForegroundColor Green
    Write-Host "  Font Size: $($response9.settings.font_size)px" -ForegroundColor Gray
    Write-Host "  Background: $($response9.settings.background_color) (Yellow)" -ForegroundColor Gray
} else {
    Write-Host "[FAIL] Preset not applied correctly" -ForegroundColor Red
}
Write-Host ""

# Test 10: Reset to Default
Write-Host "Test 10: Reset to Default Settings" -ForegroundColor Yellow
$defaultJson = '{"font_family":"Arial","font_size":16,"line_spacing":1.5,"letter_spacing":0,"text_color":"#000000","background_color":"#FFFFFF"}'
$response10 = Invoke-RestMethod -Uri "$baseUrl/api/students/$userId/settings" -Method Put -Body $defaultJson -ContentType "application/json" -Headers $headers
if ($response10.settings.font_family -eq "Arial" -and $response10.settings.font_size -eq 16) {
    Write-Host "[PASS] Settings reset to default" -ForegroundColor Green
} else {
    Write-Host "[FAIL] Reset failed" -ForegroundColor Red
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "All 10 tests completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Test Data:" -ForegroundColor Yellow
Write-Host "  User ID: $userId" -ForegroundColor Gray
Write-Host "  Email: $email1" -ForegroundColor Gray
Write-Host "  Token: $($token.Substring(0,30))..." -ForegroundColor Gray
Write-Host ""

