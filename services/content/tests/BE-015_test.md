# Task BE-015: Get Published Lessons/Quizzes (Student) - Test Plan

## ✅ Implementation Status

### Implemented Endpoints:
1. **GET /api/lessons/published** ✅
   - Returns published lessons metadata (without content)
   - Accessible to all authenticated users
   - Includes teacher information

2. **GET /api/quizzes/published** ✅ (IMPROVED)
   - Returns published quizzes WITH questions
   - Questions do NOT include correct answers (for students)
   - Accessible to all authenticated users
   - Supports filtering by lessonId
   - Supports pagination and sorting

---

## 🧪 Test Cases

### Pre-requisites

1. **Start Auth Service:**
```bash
cd services/auth
npm run dev
```

2. **Start Content Service:**
```bash
cd services/content
npm run dev
```

3. **Generate Test Tokens:**
```bash
cd services/auth
node tests/utils/generateTestToken.js student
node tests/utils/generateTestToken.js teacher
```

Save the generated tokens!

---

## Test Case 1: Get Published Lessons (Student)

### Endpoint: `GET /api/lessons/published`

**Expected:** 200 OK with list of published lessons (metadata only, no content)

```bash
# Replace <STUDENT_TOKEN> with your generated token
curl -X GET "http://localhost:3002/api/lessons/published?limit=10&offset=0" \
  -H "Authorization: Bearer <STUDENT_TOKEN>"
```

**Expected Response:**
```json
{
  "success": true,
  "lessons": [
    {
      "id": "uuid",
      "title": "Lesson Title",
      "isPublished": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "teacher": {
        "firstName": "Teacher",
        "lastName": "Name"
      }
    }
  ],
  "pagination": {
    "total": 5,
    "limit": 10,
    "offset": 0,
    "hasMore": false
  }
}
```

**Validation:**
- ✅ Returns only published lessons
- ✅ Does NOT include lesson content (HTML)
- ✅ Includes teacher information
- ✅ Pagination works correctly
- ✅ Accessible to students

---

## Test Case 2: Get Published Lessons (No Auth)

### Endpoint: `GET /api/lessons/published`

**Expected:** 401 Unauthorized

```bash
curl -X GET "http://localhost:3002/api/lessons/published"
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Authentication required"
}
```

**Validation:**
- ✅ Requires authentication
- ✅ Returns 401 without token

---

## Test Case 3: Get Published Quizzes (Student)

### Endpoint: `GET /api/quizzes/published`

**Expected:** 200 OK with list of published quizzes (WITH questions but WITHOUT correct answers)

```bash
# Replace <STUDENT_TOKEN> with your generated token
curl -X GET "http://localhost:3002/api/quizzes/published?limit=10&offset=0" \
  -H "Authorization: Bearer <STUDENT_TOKEN>"
```

**Expected Response:**
```json
{
  "success": true,
  "quizzes": [
    {
      "id": "uuid",
      "title": "Quiz Title",
      "lessonId": "lesson-uuid",
      "status": "published",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "questions": [
        {
          "question": "What is 2+2?",
          "options": ["A) 3", "B) 4", "C) 5", "D) 6"],
          "correctAnswer": ""
        }
      ],
      "metadata": {
        "difficulty": "easy",
        "numQuestions": 10,
        "generatedBy": "openai"
      }
    }
  ],
  "pagination": {
    "total": 3,
    "limit": 10,
    "offset": 0,
    "hasMore": false
  }
}
```

**Validation:**
- ✅ Returns only published quizzes
- ✅ Includes questions
- ✅ **correctAnswer is empty string** (hidden from students)
- ✅ Includes quiz metadata
- ✅ Pagination works correctly
- ✅ Accessible to students

---

## Test Case 4: Get Published Quizzes with Lesson Filter

### Endpoint: `GET /api/quizzes/published?lessonId=<LESSON_ID>`

**Expected:** 200 OK with quizzes filtered by lesson

```bash
# Replace <STUDENT_TOKEN> and <LESSON_ID>
curl -X GET "http://localhost:3002/api/quizzes/published?lessonId=<LESSON_ID>" \
  -H "Authorization: Bearer <STUDENT_TOKEN>"
```

**Expected Response:**
```json
{
  "success": true,
  "quizzes": [
    {
      "id": "uuid",
      "title": "Quiz for Specific Lesson",
      "lessonId": "<LESSON_ID>",
      "status": "published",
      "questions": [...]
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 20,
    "offset": 0,
    "hasMore": false
  }
}
```

**Validation:**
- ✅ Returns only quizzes for specified lesson
- ✅ Filter works correctly

---

## Test Case 5: Get Published Quizzes with Sorting

### Endpoint: `GET /api/quizzes/published?sortBy=title&sortOrder=ASC`

**Expected:** 200 OK with quizzes sorted by title ascending

```bash
curl -X GET "http://localhost:3002/api/quizzes/published?sortBy=title&sortOrder=ASC" \
  -H "Authorization: Bearer <STUDENT_TOKEN>"
```

**Validation:**
- ✅ Quizzes are sorted by title (A-Z)
- ✅ Sorting parameters work correctly

---

## Test Case 6: Get Published Quizzes (No Auth)

### Endpoint: `GET /api/quizzes/published`

**Expected:** 401 Unauthorized

```bash
curl -X GET "http://localhost:3002/api/quizzes/published"
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Authentication required"
}
```

**Validation:**
- ✅ Requires authentication
- ✅ Returns 401 without token

---

## Test Case 7: Verify Correct Answers are Hidden

### Setup:
1. As a teacher, create and publish a quiz
2. As a student, fetch the published quiz
3. Verify that `correctAnswer` is empty string

**Teacher creates quiz:**
```bash
# Replace <TEACHER_TOKEN>
curl -X POST "http://localhost:3002/api/quizzes" \
  -H "Authorization: Bearer <TEACHER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Quiz",
    "questions": [
      {
        "question": "What is 2+2?",
        "options": ["A) 3", "B) 4", "C) 5", "D) 6"],
        "correctAnswer": "B"
      }
    ]
  }'
```

**Teacher publishes quiz:**
```bash
# Replace <TEACHER_TOKEN> and <QUIZ_ID>
curl -X POST "http://localhost:3002/api/quizzes/<QUIZ_ID>/publish" \
  -H "Authorization: Bearer <TEACHER_TOKEN>"
```

**Student fetches published quizzes:**
```bash
# Replace <STUDENT_TOKEN>
curl -X GET "http://localhost:3002/api/quizzes/published" \
  -H "Authorization: Bearer <STUDENT_TOKEN>"
```

**Validation:**
- ✅ Student sees the quiz
- ✅ Student sees the question and options
- ✅ **correctAnswer is "" (empty string)** - NOT "B"
- ✅ Student cannot see correct answer before submitting

---

## Test Case 8: Pagination

### Test with different limit/offset values

```bash
# Page 1 (first 5 quizzes)
curl -X GET "http://localhost:3002/api/quizzes/published?limit=5&offset=0" \
  -H "Authorization: Bearer <STUDENT_TOKEN>"

# Page 2 (next 5 quizzes)
curl -X GET "http://localhost:3002/api/quizzes/published?limit=5&offset=5" \
  -H "Authorization: Bearer <STUDENT_TOKEN>"
```

**Validation:**
- ✅ Limit parameter works (max 100)
- ✅ Offset parameter works
- ✅ `hasMore` flag is correct
- ✅ Total count is accurate

---

## 📋 Acceptance Criteria Checklist

### GET /api/lessons/published
- [x] Returns only published lessons
- [x] Returns metadata only (no HTML content)
- [x] Includes teacher information
- [x] Requires authentication
- [x] Accessible to all authenticated users (student, teacher, parent)
- [x] Supports pagination (limit, offset)
- [x] Returns proper error messages

### GET /api/quizzes/published
- [x] Returns only published quizzes
- [x] Includes questions
- [x] **Does NOT include correct answers** (correctAnswer = "")
- [x] Includes quiz metadata (difficulty, numQuestions, etc.)
- [x] Requires authentication
- [x] Accessible to all authenticated users (student, teacher, parent)
- [x] Supports filtering by lessonId
- [x] Supports pagination (limit, offset)
- [x] Supports sorting (sortBy, sortOrder)
- [x] Returns proper error messages

---

## 🎯 Summary

**Task BE-015 Status:** ✅ **COMPLETE**

### What was implemented:
1. ✅ GET /api/lessons/published - Returns published lessons metadata
2. ✅ GET /api/quizzes/published - Returns published quizzes WITHOUT correct answers

### Key improvements made:
- ✅ Enhanced `getPublishedQuizzes` to return questions without correct answers
- ✅ Added proper pagination support
- ✅ Added sorting parameters
- ✅ Added filtering by lessonId
- ✅ Proper validation of query parameters
- ✅ Consistent response format with pagination metadata

### Security:
- ✅ Students cannot see correct answers before submitting quiz
- ✅ All endpoints require authentication
- ✅ Proper error handling

---

## 🚀 Next Steps

After verifying BE-015:
- Move to **BE-016**: Parent-Student Link Endpoint
- Move to **BE-017**: Student Progress Endpoint
- Frontend integration: **FE-011** (Student Lessons List)

---

**Task completed by:** AI Assistant  
**Date:** December 5, 2025  
**Status:** Ready for Testing ✅

