# LumoLearn Content Service

**Version:** 1.0.0
**Port:** 3002
**Status:** ✅ Operational (Task BE-007 Complete)

---

## Overview

The Content Service is a microservice responsible for managing lesson uploads and content storage in the LumoLearn platform. It handles document uploads (.docx, .pdf), parses them to HTML, and stores content in MongoDB.

## Features

- ✅ **File Upload Support**: Word (.docx) and PDF files
- ✅ **Document Parsing**: Automatic conversion to HTML
- ✅ **MongoDB Integration**: Scalable content storage
- ✅ **Health Monitoring**: Service and database health checks
- ✅ **Dynamic Configuration**: Environment-based settings
- ✅ **Error Handling**: Comprehensive error handling and validation

## Technology Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js 5.1.0
- **Database**: MongoDB 7.0
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
│   │   └── multer.ts           # File upload configuration
│   ├── controllers/
│   │   ├── healthController.ts # Health check endpoints
│   │   └── lessonController.ts # Lesson endpoints (placeholders for BE-008/009)
│   ├── middleware/
│   │   └── errorHandler.ts     # Global error handling
│   ├── routes/
│   │   ├── healthRoutes.ts     # Health check routes
│   │   └── lessonRoutes.ts     # Lesson routes
│   ├── services/
│   │   └── fileService.ts      # File parsing utilities
│   ├── types/
│   │   └── express.d.ts        # TypeScript type definitions
│   └── index.ts                # Main application entry point
├── uploads/                    # File upload directory (auto-created)
├── .env                        # Environment configuration
├── .gitignore
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

Create or verify `.env` file:

```env
# Content Service Configuration
PORT=3002
NODE_ENV=development

# MongoDB Configuration
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=lumolearn_content

# PostgreSQL Configuration (for metadata)
DATABASE_URL=postgresql://lumolearn:dev_pass@localhost:5432/lumolearn

# File Upload Configuration
MAX_FILE_SIZE_MB=10
ALLOWED_FILE_TYPES=.docx,.pdf
UPLOAD_DIR=uploads
```

### 3. Ensure MongoDB is Running

```bash
# Using Docker (recommended)
docker-compose up -d mongodb

# Or verify MongoDB is running
mongo --eval "db.version()"
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
  "timestamp": "2025-11-26T12:00:00.000Z"
}
```

### Service Info

#### Get Service Information
```
GET /
```

**Response:**
```json
{
  "success": true,
  "service": "LumoLearn Content Service",
  "version": "1.0.0",
  "status": "running",
  "environment": "development",
  "endpoints": {
    "health": "/health",
    "database": "/health/db",
    "lessons": "/api/lessons"
  },
  "configuration": {
    "maxFileSizeMB": 10,
    "allowedFileTypes": [".docx", ".pdf"],
    "mongodbConnected": true
  }
}
```

### Lesson Endpoints (Placeholders)

These endpoints are placeholders and will be fully implemented in tasks BE-008 and BE-009.

#### Upload Lesson
```
POST /api/lessons/upload
```
**Status:** 501 Not Implemented (Coming in BE-008)

#### Get Lessons
```
GET /api/lessons
```
**Status:** 501 Not Implemented (Coming in BE-009)

#### Get Lesson by ID
```
GET /api/lessons/:id
```
**Status:** 501 Not Implemented (Coming in BE-009)

---

## Configuration Details

### MongoDB Connection

The service uses a singleton pattern for MongoDB connection:

- **Connection Pooling**:
  - Max pool size: 10
  - Min pool size: 2
- **Timeouts**:
  - Connection timeout: 5 seconds
  - Socket timeout: 30 seconds
- **Auto-reconnect**: Enabled

### File Upload Configuration

- **Max file size**: 10 MB (configurable via `MAX_FILE_SIZE_MB`)
- **Allowed types**: `.docx`, `.pdf` (configurable via `ALLOWED_FILE_TYPES`)
- **Storage**: Memory storage (files processed without disk writes)
- **Upload directory**: `uploads/` (auto-created if missing)

### Security

- **CORS**: Enabled for `http://localhost:3000` (frontend)
- **Helmet**: Security headers enabled
- **Request size limits**: 10MB for JSON and URL-encoded data

---

## Error Handling

The service includes comprehensive error handling:

- **File validation errors**: 400 Bad Request
- **File size errors**: 400 Bad Request with specific message
- **Database errors**: 500 Internal Server Error
- **Not found routes**: 404 Not Found
- **Unexpected errors**: 500 Internal Server Error

All errors return consistent JSON format:
```json
{
  "success": false,
  "error": "Error message"
}
```

---

## Testing

### Manual Testing

```bash
# Start the service
npm run dev

# Test health check
curl http://localhost:3002/health

# Test database health
curl http://localhost:3002/health/db

# Get service info
curl http://localhost:3002/
```

### Automated Testing

Unit and integration tests will be added in task BE-TEST-001.

---

## Logging

Development mode includes request logging:
```
[2025-11-26T12:00:00.000Z] GET /health
[2025-11-26T12:00:01.000Z] POST /api/lessons/upload
```

Production mode has minimal logging for performance.

---

## Graceful Shutdown

The service handles shutdown signals (SIGTERM, SIGINT):
1. Closes MongoDB connection
2. Exits cleanly

---

## Next Steps

### Task BE-008: Lesson Upload Endpoint
- Implement file upload with multer
- Parse documents to HTML
- Store content in MongoDB
- Create metadata in PostgreSQL

### Task BE-009: Get Lessons Endpoints
- Implement lesson listing for teachers
- Implement single lesson retrieval
- Integrate MongoDB + PostgreSQL queries

---

## Troubleshooting

### MongoDB Connection Failed

**Error:** `Database connection failed`

**Solution:**
1. Verify MongoDB is running: `docker-compose up -d mongodb`
2. Check connection URL in `.env`
3. Test connection: `mongo mongodb://localhost:27017`

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3002`

**Solution:**
1. Check if service is already running: `lsof -i :3002`
2. Kill existing process or change port in `.env`

### File Upload Fails

**Error:** `Invalid file type` or `File too large`

**Solution:**
1. Verify file type is `.docx` or `.pdf`
2. Check file size is under 10MB
3. Adjust `MAX_FILE_SIZE_MB` in `.env` if needed

---

## Task Completion Checklist

### BE-007 Acceptance Criteria

- [x] Service starts on port 3002
- [x] MongoDB connection works
- [x] Health check endpoint responds
- [x] Database health check works
- [x] Basic project structure established
- [x] File upload configuration ready
- [x] Error handling implemented
- [x] Dynamic configuration from .env
- [x] Follows established code patterns
- [x] Documentation complete

---

## Development Notes

### Code Patterns Followed

1. **Singleton Pattern**: Used for MongoDB connection
2. **Middleware Chain**: Health checks → Routes → Error handling
3. **TypeScript**: Strict type checking enabled
4. **Environment Variables**: All configuration externalized
5. **Error Handling**: Consistent error response format
6. **Logging**: Request logging in development mode

### Design Decisions

1. **Memory Storage**: Multer configured for memory storage (no disk writes) for better performance
2. **MongoDB Singleton**: Single connection instance reused across requests
3. **Placeholder Endpoints**: 501 responses for future implementations (BE-008, BE-009)
4. **Dynamic Config**: All magic numbers externalized to environment variables
5. **Graceful Shutdown**: Proper cleanup on process termination

---

**Task BE-007 Status:** ✅ **COMPLETE**

**Completed by:** Claude Code
**Date:** 2025-11-26
**Next Task:** BE-008 (Lesson Upload Endpoint)
