# LumoLearn Content Service

**Version:** 1.0.0
**Port:** 3002
**Status:** ✅ Operational (Tasks BE-007, BE-008, BE-009 Complete)

---

## Overview

The Content Service is a microservice responsible for managing lesson uploads and content storage in the LumoLearn platform. It handles document uploads (.docx, .pdf), parses them to HTML, and stores content in MongoDB with metadata in PostgreSQL.

## Features

- ✅ **File Upload Support**: Word (.docx) and PDF files
- ✅ **Document Parsing**: Automatic conversion to HTML
- ✅ **MongoDB Integration**: Scalable HTML content storage
- ✅ **PostgreSQL Integration**: Lesson metadata and relationships
- ✅ **JWT Authentication**: Protected endpoints with role-based access
- ✅ **Health Monitoring**: Service and database health checks
- ✅ **Dynamic Configuration**: Environment-based settings
- ✅ **Error Handling**: Comprehensive error handling and validation

## Technology Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js 5.1.0
- **Databases**: 
  - MongoDB 7.0 (content storage)
  - PostgreSQL 15 (metadata storage)
- **Authentication**: JWT (jsonwebtoken)
- **File Processing**:
  - `mammoth` - Word document parsing
  - `pdf-parse` - PDF document parsing
  - `multer` - File upload handling
- **Security**: helmet, CORS
- **Validation**: express-validator

---

## Project Structure

```
services/content/
├── src/
│   ├── config/
│   │   ├── database.ts         # MongoDB connection configuration
│   │   ├── postgres.ts         # PostgreSQL connection configuration
│   │   └── multer.ts           # File upload configuration
│   ├── controllers/
│   │   ├── healthController.ts # Health check endpoints
│   │   └── lessonController.ts # Lesson CRUD endpoints
│   ├── middleware/
│   │   ├── auth.ts             # JWT authentication middleware
│   │   └── errorHandler.ts     # Global error handling
│   ├── routes/
│   │   ├── healthRoutes.ts     # Health check routes
│   │   └── lessonRoutes.ts     # Lesson routes
│   ├── services/
│   │   ├── fileService.ts      # File parsing utilities
│   │   └── lessonService.ts    # Lesson database operations
│   ├── types/
│   │   └── express.d.ts        # TypeScript type definitions
│   └── index.ts                # Main application entry point
├── uploads/                    # File upload directory (auto-created)
├── .env                        # Environment configuration
├── package.json
├── tsconfig.json
└── README.md
```

---

## Installation

### 1. Install Dependencies

```bash
cd services/content
npm install
```

### 2. Configure Environment

Create `.env` file with:

```env
# Server Configuration
PORT=3002
NODE_ENV=development

# MongoDB Configuration
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=lumolearn_content

# PostgreSQL Configuration (same as auth service)
DATABASE_URL=postgresql://lumolearn:dev_pass@localhost:5432/lumolearn

# PostgreSQL Pool Settings (optional)
PG_MAX_POOL_SIZE=10
PG_IDLE_TIMEOUT_MS=30000
PG_CONNECTION_TIMEOUT_MS=5000

# JWT Configuration (must match auth service)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=15m

# File Upload Configuration
MAX_FILE_SIZE_MB=10
ALLOWED_FILE_TYPES=.docx,.pdf
UPLOAD_DIR=uploads

# CORS Configuration (comma-separated for multiple origins)
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

### 3. Ensure Databases are Running

```bash
# Using Docker (recommended)
docker-compose up -d mongodb postgres

# Verify connections
mongo --eval "db.version()"
psql -U lumolearn -d lumolearn -c "SELECT 1"
```

---

## Usage

### Development Mode

```bash
npm run dev
```

This starts the service with nodemon for auto-reload on file changes.

### Production Mode

```bash
# Build TypeScript
npm run build

# Start compiled service
npm start
```

---

## API Endpoints

### Health Checks

#### Basic Health Check
```
GET /health
```

**Response:**
```json
{
  "success": true,
  "message": "Content Service is running",
  "timestamp": "2025-11-26T12:00:00.000Z",
  "service": "content",
  "version": "1.0.0"
}
```

#### Database Health Check
```
GET /health/db
```

**Response:**
```json
{
  "success": true,
  "mongodb": "connected",
  "postgres": "connected",
  "timestamp": "2025-11-26T12:00:00.000Z"
}
```

---

### Lesson Endpoints

All lesson endpoints require JWT authentication via `Authorization: Bearer <token>` header.

#### Upload Lesson (Teacher Only)

```
POST /api/lessons/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>

file: <.docx or .pdf file>
title: "Lesson Title"
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Lesson uploaded successfully",
  "lesson": {
    "id": "uuid",
    "title": "Lesson Title",
    "contentId": "mongo-object-id",
    "teacherId": "uuid",
    "isPublished": false,
    "createdAt": "2025-11-26T12:00:00.000Z"
  },
  "fileInfo": {
    "originalName": "document.docx",
    "size": 12345,
    "type": "docx"
  }
}
```

#### Get Teacher's Lessons (Teacher Only)

```
GET /api/lessons
Authorization: Bearer <token>

Query Parameters:
- isPublished: boolean (optional) - Filter by published status
- limit: number (default: 20, max: 100)
- offset: number (default: 0)
- sortBy: 'created_at' | 'title' (default: 'created_at')
- sortOrder: 'ASC' | 'DESC' (default: 'DESC')
```

**Response:**
```json
{
  "success": true,
  "lessons": [
    {
      "id": "uuid",
      "teacherId": "uuid",
      "title": "Lesson Title",
      "contentId": "mongo-object-id",
      "isPublished": false,
      "createdAt": "2025-11-26T12:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 50,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

#### Get Published Lessons (Any Authenticated User)

```
GET /api/lessons/published
Authorization: Bearer <token>

Query Parameters:
- limit: number (default: 20, max: 100)
- offset: number (default: 0)
```

**Response:**
```json
{
  "success": true,
  "lessons": [
    {
      "id": "uuid",
      "title": "Lesson Title",
      "isPublished": true,
      "createdAt": "2025-11-26T12:00:00.000Z",
      "teacher": {
        "firstName": "John",
        "lastName": "Doe"
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

#### Get Lesson by ID

```
GET /api/lessons/:id
Authorization: Bearer <token>
```

**Access:**
- Teachers can view their own lessons (published or unpublished)
- Other users can only view published lessons

**Response:**
```json
{
  "success": true,
  "lesson": {
    "id": "uuid",
    "title": "Lesson Title",
    "content": "<html>Lesson HTML content...</html>",
    "isPublished": true,
    "createdAt": "2025-11-26T12:00:00.000Z",
    "fileMetadata": {
      "fileType": "docx",
      "fileName": "document.docx",
      "fileSize": 12345
    }
  }
}
```

#### Update Lesson Title (Teacher Only - Owner)

```
PUT /api/lessons/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "New Title"
}
```

#### Publish Lesson (Teacher Only - Owner)

```
PUT /api/lessons/:id/publish
Authorization: Bearer <token>
```

#### Unpublish Lesson (Teacher Only - Owner)

```
PUT /api/lessons/:id/unpublish
Authorization: Bearer <token>
```

#### Delete Lesson (Teacher Only - Owner)

```
DELETE /api/lessons/:id
Authorization: Bearer <token>
```

---

## Authentication

The service uses JWT tokens for authentication. Tokens must be obtained from the Auth Service (`/api/auth/login`).

### Token Payload Structure
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "role": "teacher" | "student" | "parent"
}
```

### Role-Based Access

| Endpoint | Teacher | Student | Parent |
|----------|---------|---------|--------|
| POST /api/lessons/upload | ✅ | ❌ | ❌ |
| GET /api/lessons | ✅ | ❌ | ❌ |
| GET /api/lessons/published | ✅ | ✅ | ✅ |
| GET /api/lessons/:id | ✅* | ✅** | ✅** |
| PUT /api/lessons/:id | ✅* | ❌ | ❌ |
| PUT /api/lessons/:id/publish | ✅* | ❌ | ❌ |
| DELETE /api/lessons/:id | ✅* | ❌ | ❌ |

\* Only lesson owner
\** Only published lessons

---

## Error Handling

All errors return consistent JSON format:

```json
{
  "success": false,
  "error": "Error message"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Internal Server Error |
| 503 | Service Unavailable (database down) |

---

## Testing

### Manual Testing with cURL

```bash
# Get auth token first (from auth service)
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@test.com","password":"Test1234!"}' | jq -r '.token')

# Upload a lesson
curl -X POST http://localhost:3002/api/lessons/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@document.docx" \
  -F "title=My First Lesson"

# Get all lessons
curl -X GET http://localhost:3002/api/lessons \
  -H "Authorization: Bearer $TOKEN"

# Get single lesson
curl -X GET http://localhost:3002/api/lessons/{lesson-id} \
  -H "Authorization: Bearer $TOKEN"

# Publish lesson
curl -X PUT http://localhost:3002/api/lessons/{lesson-id}/publish \
  -H "Authorization: Bearer $TOKEN"

# Get published lessons (any authenticated user)
curl -X GET http://localhost:3002/api/lessons/published \
  -H "Authorization: Bearer $TOKEN"
```

---

## Configuration Details

### Database Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     DATA STORAGE                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PostgreSQL (lessons table)     MongoDB (lessons collection)│
│  ┌─────────────────────────┐   ┌─────────────────────────┐ │
│  │ id (UUID)               │   │ _id (ObjectId)          │ │
│  │ teacher_id (UUID)       │   │ html (string)           │ │
│  │ title (varchar)         │──▶│ plainText (string)      │ │
│  │ content_id (ref)────────│   │ metadata (object)       │ │
│  │ is_published (bool)     │   │ createdAt (date)        │ │
│  │ created_at (timestamp)  │   │ updatedAt (date)        │ │
│  └─────────────────────────┘   └─────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### PostgreSQL Connection Pool

- **Max pool size**: 10 (configurable)
- **Idle timeout**: 30 seconds
- **Connection timeout**: 5 seconds

### MongoDB Connection

- **Max pool size**: 10
- **Min pool size**: 2
- **Connection timeout**: 5 seconds
- **Socket timeout**: 30 seconds

### File Upload

- **Max file size**: 10 MB (configurable)
- **Allowed types**: `.docx`, `.pdf` (configurable)
- **Storage**: Memory storage (no disk writes)

---

## Task Completion Checklist

### BE-007 Acceptance Criteria ✅

- [x] Service starts on port 3002
- [x] MongoDB connection works
- [x] Health check endpoint responds
- [x] Basic project structure established

### BE-008 Acceptance Criteria ✅

- [x] File upload radi (multer)
- [x] Validacija file tipa (.docx, .pdf)
- [x] Word parsing radi (mammoth)
- [x] PDF parsing radi (pdf-parse)
- [x] HTML se čuva u MongoDB
- [x] Record se kreira u PostgreSQL
- [x] Vraća lesson ID
- [x] Error handling za sve edge cases

### BE-009 Acceptance Criteria ✅

- [x] Lista lekcija za teacher-a
- [x] Single lesson sa content-om
- [x] MongoDB + PostgreSQL integracija
- [x] Pagination podrška
- [x] Sortiranje po datumu/naslovu
- [x] Filtriranje po publish statusu

### BE-010 (Bonus) Acceptance Criteria ✅

- [x] Update `is_published` flag
- [x] Samo teacher može publish-ovati svoje lekcije

---

**Tasks BE-008, BE-009, BE-010 Status:** ✅ **COMPLETE**

**Completed by:** Backend Developer
**Date:** 2025-11-27
