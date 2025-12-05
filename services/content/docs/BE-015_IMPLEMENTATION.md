# BE-015: Get Published Lessons/Quizzes (Student) - Implementation Documentation

## 📋 Task Overview

**Task ID:** BE-015  
**Priority:** P1 (Critical)  
**Sprint:** 9-10 (Student Flow)  
**Estimated Time:** 1 day  
**Status:** ✅ **COMPLETE**

---

## 🎯 Objective

Implementirati endpoint-e za studente da mogu da vide sve published lekcije i quiz-ove:
1. **GET /api/lessons/published** - Vraća sve published lekcije (samo metadata, bez HTML content-a)
2. **GET /api/quizzes/published** - Vraća sve published quiz-ove (sa questions ali **BEZ correct answers**)

---

## 📝 Requirements (from MVP_TASKS.md)

### Instrukcije:
1. **GET /api/lessons/published:**
   - Vrati sve published lekcije (bez content-a, samo metadata)

2. **GET /api/quizzes/published:**
   - Vrati sve published quiz-ove (bez correct answers)

### Acceptance Criteria:
- [x] Vraća samo published content
- [x] Student ne vidi correct answers pre submit-a

---

## 🏗️ Implementation Details

### 1. GET /api/lessons/published

**File:** `services/content/src/controllers/lessonController.ts`  
**Lines:** 625-692

#### Features:
- ✅ Returns only published lessons (`is_published = true`)
- ✅ Returns metadata only (id, title, isPublished, createdAt)
- ✅ Includes teacher information (firstName, lastName)
- ✅ Does NOT include HTML content
- ✅ Supports pagination (limit, offset)
- ✅ Requires authentication (all roles)

#### Query Parameters:
| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| `limit` | number | 20 | 100 | Number of lessons to return |
| `offset` | number | 0 | - | Number of lessons to skip |

#### Response Format:
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
    "total": 10,
    "limit": 20,
    "offset": 0,
    "hasMore": false
  }
}
```

#### Database Query:
```sql
SELECT 
  l.id, 
  l.title, 
  l.is_published as "isPublished", 
  l.created_at as "createdAt",
  p.first_name as "teacherFirstName", 
  p.last_name as "teacherLastName"
FROM lessons l
JOIN teachers t ON l.teacher_id = t.id
JOIN profiles p ON t.user_id = p.user_id
WHERE l.is_published = true
ORDER BY l.created_at DESC
LIMIT $1 OFFSET $2
```

---

### 2. GET /api/quizzes/published

**File:** `services/content/src/controllers/quizController.ts`  
**Lines:** 271-363 (IMPROVED)

#### Features:
- ✅ Returns only published quizzes (`status = 'published'`)
- ✅ Returns quiz metadata (id, title, lessonId, status, createdAt, updatedAt)
- ✅ **Includes questions** (question text and options)
- ✅ **Hides correct answers** (correctAnswer = "" for students)
- ✅ Includes quiz metadata (difficulty, numQuestions, generatedBy)
- ✅ Supports filtering by lessonId
- ✅ Supports pagination (limit, offset)
- ✅ Supports sorting (sortBy, sortOrder)
- ✅ Requires authentication (all roles)

#### Query Parameters:
| Parameter | Type | Default | Options | Description |
|-----------|------|---------|---------|-------------|
| `lessonId` | string | - | UUID | Filter quizzes by lesson |
| `limit` | number | 20 | 1-100 | Number of quizzes to return |
| `offset` | number | 0 | - | Number of quizzes to skip |
| `sortBy` | string | created_at | created_at, updated_at, title | Sort field |
| `sortOrder` | string | DESC | ASC, DESC | Sort order |

#### Response Format:
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
    "total": 5,
    "limit": 20,
    "offset": 0,
    "hasMore": false
  }
}
```

#### Implementation Flow:
1. Validate authentication
2. Parse and validate query parameters
3. Fetch published quizzes metadata from PostgreSQL
4. For each quiz, fetch questions from MongoDB
5. **Remove correct answers** by calling `getQuizWithContent(quizId, false)`
6. Return quizzes with questions (without correct answers)

#### Key Code:
```typescript
// Fetch quizzes WITHOUT correct answers
const quizzesWithQuestions = await Promise.all(
  result.quizzes.map(async (quiz) => {
    // includeAnswers = false hides correct answers
    const quizWithContent = await getQuizWithContent(quiz.id, false);
    
    if (quizWithContent && quizWithContent.questions) {
      return {
        ...quiz,
        questions: quizWithContent.questions, // correctAnswer = ""
        metadata: quizWithContent.quizMetadata,
      };
    }
    
    return quiz;
  })
);
```

---

## 🔒 Security Considerations

### 1. Authentication Required
Both endpoints require JWT authentication:
```typescript
if (!req.user) {
  res.status(401).json({
    success: false,
    error: 'Authentication required',
  });
  return;
}
```

### 2. Correct Answers Hidden
Students **cannot** see correct answers before submitting quiz:
```typescript
// In quizService.ts - getQuizWithContent()
const questions = includeAnswers
  ? content.questions
  : content.questions.map(q => ({
      question: q.question,
      options: q.options,
      correctAnswer: '', // Hidden for students
    }));
```

### 3. Only Published Content
Students can only see published content:
- Lessons: `WHERE is_published = true`
- Quizzes: `WHERE status = 'published'`

---

## 🧪 Testing

### Test Files:
1. **Test Plan:** `services/content/tests/BE-015_test.md`
2. **PowerShell Script:** `services/content/tests/test-BE-015.ps1`

### Run Tests:
```powershell
# PowerShell (Windows)
cd services/content
.\tests\test-BE-015.ps1
```

### Manual Testing:
```bash
# 1. Get token
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@test.com","password":"Test1234!"}' | jq -r '.token')

# 2. Test published lessons
curl -X GET "http://localhost:3002/api/lessons/published?limit=10" \
  -H "Authorization: Bearer $TOKEN"

# 3. Test published quizzes
curl -X GET "http://localhost:3002/api/quizzes/published?limit=10" \
  -H "Authorization: Bearer $TOKEN"

# 4. Test quiz filtering by lesson
curl -X GET "http://localhost:3002/api/quizzes/published?lessonId=<LESSON_ID>" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 Database Schema

### PostgreSQL Tables:

#### lessons
```sql
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES teachers(id),
  title VARCHAR(255) NOT NULL,
  content_id VARCHAR(255),
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### quizzes
```sql
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES teachers(id),
  lesson_id UUID REFERENCES lessons(id),
  title VARCHAR(255) NOT NULL,
  content_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### MongoDB Collections:

#### lessons
```javascript
{
  _id: ObjectId,
  html: String,
  plainText: String,
  metadata: {
    fileType: String,
    fileName: String,
    fileSize: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### quizzes
```javascript
{
  _id: ObjectId,
  questions: [
    {
      question: String,
      options: [String],
      correctAnswer: String
    }
  ],
  metadata: {
    difficulty: String,
    numQuestions: Number,
    generatedBy: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔄 API Routes

### Route Registration:
**File:** `services/content/src/routes/lessonRoutes.ts`
```typescript
router.get('/published', authenticateToken, getPublishedLessons);
```

**File:** `services/content/src/routes/quizRoutes.ts`
```typescript
router.get('/published', authenticateToken, getPublishedQuizzes);
```

### Middleware Chain:
1. `authenticateToken` - Verifies JWT token
2. Controller function - Handles business logic

---

## 📈 Performance Considerations

### 1. Pagination
- Default limit: 20
- Maximum limit: 100
- Prevents large data transfers

### 2. Database Queries
- Indexed on `is_published` and `status` columns
- Efficient JOIN operations
- Separate count query for total

### 3. MongoDB Fetching
- Parallel fetching using `Promise.all()`
- Only fetches questions when needed
- Efficient ObjectId lookups

---

## 🐛 Error Handling

### Common Errors:

| Status | Error | Cause | Solution |
|--------|-------|-------|----------|
| 401 | Authentication required | No token provided | Include Authorization header |
| 401 | Invalid token | Token expired/invalid | Login again to get new token |
| 500 | Database error | DB connection issue | Check MongoDB/PostgreSQL |

### Error Response Format:
```json
{
  "success": false,
  "error": "Error message"
}
```

---

## 🚀 Deployment Notes

### Environment Variables:
```env
# Content Service (.env)
PORT=3002
MONGODB_URL=mongodb://localhost:27017
DATABASE_URL=postgresql://lumolearn:dev_pass@localhost:5432/lumolearn
JWT_SECRET=your-secret-key
```

### Dependencies:
- MongoDB connection
- PostgreSQL connection
- Auth Service (for JWT verification)

---

## 📚 Related Tasks

### Depends On:
- ✅ BE-007: Content Service Setup
- ✅ BE-008: Lesson Upload Endpoint
- ✅ BE-009: Get Lessons Endpoints
- ✅ BE-010: Publish Lesson Endpoint
- ✅ BE-013: Quiz CRUD Endpoints

### Required By:
- 🔄 FE-011: Student Lessons List (Frontend)
- 🔄 FE-012: Quiz Taker Component (Frontend)

---

## ✅ Acceptance Criteria Status

- [x] GET /api/lessons/published returns only published lessons
- [x] Lessons response does NOT include HTML content
- [x] GET /api/quizzes/published returns only published quizzes
- [x] Quizzes response includes questions
- [x] **Correct answers are hidden** (correctAnswer = "")
- [x] Both endpoints require authentication
- [x] Pagination works correctly
- [x] Filtering by lessonId works
- [x] Sorting works correctly
- [x] Proper error handling
- [x] Test documentation created
- [x] Test script created

---

## 📝 Notes

### Key Improvements Made:
1. **Enhanced `getPublishedQuizzes`** to return questions without correct answers
2. Added comprehensive query parameter validation
3. Added sorting and filtering capabilities
4. Consistent pagination response format
5. Proper error handling and logging

### Security:
- ✅ Students cannot see correct answers before submitting
- ✅ Only published content is visible
- ✅ Authentication required for all endpoints

---

**Implementation Date:** December 5, 2025  
**Implemented By:** AI Assistant  
**Status:** ✅ Complete and Tested  
**Next Task:** BE-016 (Parent-Student Link Endpoint)

