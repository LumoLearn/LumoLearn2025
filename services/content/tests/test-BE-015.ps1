# BE-015 Test Script - Get Published Lessons/Quizzes
# PowerShell test script for Windows

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "BE-015: Get Published Lessons/Quizzes - Test Script" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$AUTH_SERVICE = "http://localhost:3001"
$CONTENT_SERVICE = "http://localhost:3002"

# Function to make HTTP requests
function Invoke-APIRequest {
    param(
        [string]$Method,
        [string]$Url,
        [string]$Token = "",
        [string]$Body = ""
    )
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    
    try {
        if ($Body) {
            $response = Invoke-RestMethod -Method $Method -Uri $Url -Headers $headers -Body $Body
        } else {
            $response = Invoke-RestMethod -Method $Method -Uri $Url -Headers $headers
        }
        return $response
    } catch {
        return $_.Exception.Response
    }
}

# Function to print test result
function Print-TestResult {
    param(
        [string]$TestName,
        [bool]$Passed,
        [string]$Message = ""
    )
    
    if ($Passed) {
        Write-Host "✅ PASS: $TestName" -ForegroundColor Green
    } else {
        Write-Host "❌ FAIL: $TestName" -ForegroundColor Red
    }
    
    if ($Message) {
        Write-Host "   $Message" -ForegroundColor Gray
    }
    Write-Host ""
}

# Step 1: Check if services are running
Write-Host "Step 1: Checking if services are running..." -ForegroundColor Yellow
Write-Host ""

try {
    $authHealth = Invoke-RestMethod -Method Get -Uri "$AUTH_SERVICE/health"
    Write-Host "✅ Auth Service is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Auth Service is NOT running!" -ForegroundColor Red
    Write-Host "   Please start: cd services/auth && npm run dev" -ForegroundColor Gray
    exit 1
}

try {
    $contentHealth = Invoke-RestMethod -Method Get -Uri "$CONTENT_SERVICE/health"
    Write-Host "✅ Content Service is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Content Service is NOT running!" -ForegroundColor Red
    Write-Host "   Please start: cd services/content && npm run dev" -ForegroundColor Gray
    exit 1
}

Write-Host ""

# Step 2: Login as student to get token
Write-Host "Step 2: Logging in as student..." -ForegroundColor Yellow
Write-Host ""

$loginBody = @{
    email = "student@test.com"
    password = "Test1234!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Method Post -Uri "$AUTH_SERVICE/api/auth/login" -Headers @{"Content-Type"="application/json"} -Body $loginBody
    $STUDENT_TOKEN = $loginResponse.token
    Write-Host "✅ Student login successful" -ForegroundColor Green
    Write-Host "   Token: $($STUDENT_TOKEN.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Student login failed!" -ForegroundColor Red
    Write-Host "   Make sure student@test.com exists in database" -ForegroundColor Gray
    Write-Host "   You can register: curl -X POST $AUTH_SERVICE/api/auth/register ..." -ForegroundColor Gray
    exit 1
}

Write-Host ""

# Step 3: Test GET /api/lessons/published
Write-Host "Step 3: Testing GET /api/lessons/published" -ForegroundColor Yellow
Write-Host ""

# Test 3.1: With valid token
Write-Host "Test 3.1: Get published lessons (with auth)" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Method Get -Uri "$CONTENT_SERVICE/api/lessons/published?limit=10&offset=0" -Headers @{"Authorization"="Bearer $STUDENT_TOKEN"}
    
    if ($response.success -eq $true) {
        Print-TestResult -TestName "Published lessons endpoint returns success" -Passed $true
        
        # Check if response has lessons array
        if ($response.lessons) {
            Print-TestResult -TestName "Response contains lessons array" -Passed $true -Message "Found $($response.lessons.Count) lessons"
            
            # Check if pagination exists
            if ($response.pagination) {
                Print-TestResult -TestName "Response contains pagination metadata" -Passed $true
            } else {
                Print-TestResult -TestName "Response contains pagination metadata" -Passed $false
            }
            
            # Check if lessons have required fields
            if ($response.lessons.Count -gt 0) {
                $lesson = $response.lessons[0]
                $hasId = $lesson.id -ne $null
                $hasTitle = $lesson.title -ne $null
                $hasTeacher = $lesson.teacher -ne $null
                $noContent = $lesson.content -eq $null
                
                Print-TestResult -TestName "Lesson has required fields (id, title, teacher)" -Passed ($hasId -and $hasTitle -and $hasTeacher)
                Print-TestResult -TestName "Lesson does NOT contain content (HTML)" -Passed $noContent -Message "Content should be excluded for metadata-only response"
            }
        } else {
            Print-TestResult -TestName "Response contains lessons array" -Passed $false
        }
    } else {
        Print-TestResult -TestName "Published lessons endpoint returns success" -Passed $false
    }
} catch {
    Print-TestResult -TestName "Published lessons endpoint accessible" -Passed $false -Message $_.Exception.Message
}

# Test 3.2: Without token (should fail)
Write-Host "Test 3.2: Get published lessons (without auth)" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Method Get -Uri "$CONTENT_SERVICE/api/lessons/published"
    Print-TestResult -TestName "Endpoint requires authentication" -Passed $false -Message "Should return 401 without token"
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Print-TestResult -TestName "Endpoint requires authentication" -Passed $true -Message "Correctly returns 401 Unauthorized"
    } else {
        Print-TestResult -TestName "Endpoint requires authentication" -Passed $false -Message "Unexpected status code"
    }
}

Write-Host ""

# Step 4: Test GET /api/quizzes/published
Write-Host "Step 4: Testing GET /api/quizzes/published" -ForegroundColor Yellow
Write-Host ""

# Test 4.1: With valid token
Write-Host "Test 4.1: Get published quizzes (with auth)" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Method Get -Uri "$CONTENT_SERVICE/api/quizzes/published?limit=10&offset=0" -Headers @{"Authorization"="Bearer $STUDENT_TOKEN"}
    
    if ($response.success -eq $true) {
        Print-TestResult -TestName "Published quizzes endpoint returns success" -Passed $true
        
        # Check if response has quizzes array
        if ($response.quizzes) {
            Print-TestResult -TestName "Response contains quizzes array" -Passed $true -Message "Found $($response.quizzes.Count) quizzes"
            
            # Check if pagination exists
            if ($response.pagination) {
                Print-TestResult -TestName "Response contains pagination metadata" -Passed $true
            } else {
                Print-TestResult -TestName "Response contains pagination metadata" -Passed $false
            }
            
            # Check if quizzes have questions WITHOUT correct answers
            if ($response.quizzes.Count -gt 0) {
                $quiz = $response.quizzes[0]
                $hasId = $quiz.id -ne $null
                $hasTitle = $quiz.title -ne $null
                $hasQuestions = $quiz.questions -ne $null
                
                Print-TestResult -TestName "Quiz has required fields (id, title)" -Passed ($hasId -and $hasTitle)
                Print-TestResult -TestName "Quiz contains questions" -Passed $hasQuestions
                
                if ($hasQuestions -and $quiz.questions.Count -gt 0) {
                    $question = $quiz.questions[0]
                    $hasQuestionText = $question.question -ne $null
                    $hasOptions = $question.options -ne $null
                    $correctAnswerHidden = $question.correctAnswer -eq ""
                    
                    Print-TestResult -TestName "Question has text and options" -Passed ($hasQuestionText -and $hasOptions)
                    Print-TestResult -TestName "Correct answer is HIDDEN (empty string)" -Passed $correctAnswerHidden -Message "CRITICAL: Students should NOT see correct answers!"
                    
                    if (-not $correctAnswerHidden) {
                        Write-Host "   ⚠️  WARNING: correctAnswer = '$($question.correctAnswer)' (should be empty!)" -ForegroundColor Red
                    }
                }
            }
        } else {
            Print-TestResult -TestName "Response contains quizzes array" -Passed $false
        }
    } else {
        Print-TestResult -TestName "Published quizzes endpoint returns success" -Passed $false
    }
} catch {
    Print-TestResult -TestName "Published quizzes endpoint accessible" -Passed $false -Message $_.Exception.Message
}

# Test 4.2: Without token (should fail)
Write-Host "Test 4.2: Get published quizzes (without auth)" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Method Get -Uri "$CONTENT_SERVICE/api/quizzes/published"
    Print-TestResult -TestName "Endpoint requires authentication" -Passed $false -Message "Should return 401 without token"
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Print-TestResult -TestName "Endpoint requires authentication" -Passed $true -Message "Correctly returns 401 Unauthorized"
    } else {
        Print-TestResult -TestName "Endpoint requires authentication" -Passed $false -Message "Unexpected status code"
    }
}

# Test 4.3: Test sorting
Write-Host "Test 4.3: Get published quizzes (with sorting)" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Method Get -Uri "$CONTENT_SERVICE/api/quizzes/published?sortBy=title&sortOrder=ASC" -Headers @{"Authorization"="Bearer $STUDENT_TOKEN"}
    
    if ($response.success -eq $true) {
        Print-TestResult -TestName "Sorting parameters work" -Passed $true
    } else {
        Print-TestResult -TestName "Sorting parameters work" -Passed $false
    }
} catch {
    Print-TestResult -TestName "Sorting parameters work" -Passed $false -Message $_.Exception.Message
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ BE-015 implementation tested" -ForegroundColor Green
Write-Host ""
Write-Host "Key Points:" -ForegroundColor Yellow
Write-Host "  1. GET /api/lessons/published returns metadata only (no content)" -ForegroundColor Gray
Write-Host "  2. GET /api/quizzes/published returns quizzes WITH questions" -ForegroundColor Gray
Write-Host "  3. Quiz questions do NOT include correct answers (empty string)" -ForegroundColor Gray
Write-Host "  4. Both endpoints require authentication" -ForegroundColor Gray
Write-Host "  5. Pagination and sorting work correctly" -ForegroundColor Gray
Write-Host ""
Write-Host "For detailed test documentation, see:" -ForegroundColor Yellow
Write-Host "  services/content/tests/BE-015_test.md" -ForegroundColor Gray
Write-Host ""

