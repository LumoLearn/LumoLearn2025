# Task BE-003: JWT Authentication Middleware - Test Plan

## ✅ Implementation Checklist

- [x] Kreiran `src/middleware/auth.ts` sa `authenticateToken()` funkcijom
- [x] Implementiran `requireRole()` middleware za role-based access
- [x] Dodat `generateToken()` helper funkcija
- [x] Kreiran TypeScript type definitions (`src/types/express.d.ts`)
- [x] Ažuriran `tsconfig.json` da uključi custom types
- [x] Kreirani test routes (`src/routes/testRoutes.ts`)
- [x] Registrovani test routes u `src/index.ts`
- [x] Kreirana dokumentacija
- [x] Kreirna helper skripta za generisanje test tokena

---

## 🧪 Test Cases

### Pre-requisite: Setup

1. **Proveri da li .env fajl postoji:**
```bash
cd services/auth
ls -la .env
```

Ako ne postoji, kreiraj ga:
```bash
echo "PORT=3001" > .env
echo "DATABASE_URL=postgresql://lumolearn:dev_pass@localhost:5432/lumolearn" >> .env
echo "JWT_SECRET=dev-secret-key-for-testing-only-change-in-production" >> .env
echo "JWT_EXPIRES_IN=15m" >> .env
```

2. **Pokreni auth service:**
```bash
cd services/auth
npm run dev
```

3. **Generiši test token:**
```bash
node src/utils/generateTestToken.js student
```
Sačuvaj token koji se prikaže!

---

### Test Case 1: Valid Token ✅

**Endpoint:** `GET /api/test/profile`  
**Expected:** 200 OK

```bash
# Zameni <TOKEN> sa generisanim tokenom
curl -X GET http://localhost:3001/api/test/profile \
  -H "Authorization: Bearer <TOKEN>"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Protected route accessed successfully",
  "user": {
    "userId": "uuid",
    "email": "student@test.com",
    "role": "student"
  }
}
```

✅ **PASS** - Ako vidiš user info  
❌ **FAIL** - Ako dobiješ 401 error

---

### Test Case 2: Missing Token ❌

**Endpoint:** `GET /api/test/profile`  
**Expected:** 401 Unauthorized

```bash
curl -X GET http://localhost:3001/api/test/profile
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Access denied. No token provided."
}
```

✅ **PASS** - Ako dobiješ 401 sa ovom porukom  
❌ **FAIL** - Ako dobiješ 200 ili drugu poruku

---

### Test Case 3: Invalid Token ❌

**Endpoint:** `GET /api/test/profile`  
**Expected:** 401 Unauthorized

```bash
curl -X GET http://localhost:3001/api/test/profile \
  -H "Authorization: Bearer invalid-token-123"
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Invalid token"
}
```

✅ **PASS** - Ako dobiješ 401 sa "Invalid token"  
❌ **FAIL** - Ako dobiješ 200 ili drugačiju poruku

---

### Test Case 4: Expired Token ⏱️

**Endpoint:** `GET /api/test/profile`  
**Expected:** 401 Unauthorized

```bash
# Koristi ovaj test token (namerno expired)
# eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJyb2xlIjoic3R1ZGVudCIsImlhdCI6MTYwOTQ1OTIwMCwiZXhwIjoxNjA5NDU5MjAxfQ.x

curl -X GET http://localhost:3001/api/test/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Token expired"
}
```

✅ **PASS** - Ako dobiješ "Token expired"  
❌ **FAIL** - Ako dobiješ 200

---

### Test Case 5: Role-Based Access - Teacher Only (Student trying) ❌

**Endpoint:** `GET /api/test/teacher-only`  
**Expected:** 403 Forbidden

```bash
# Generiši STUDENT token
node src/utils/generateTestToken.js student

# Pokušaj da pristupiš teacher-only route
curl -X GET http://localhost:3001/api/test/teacher-only \
  -H "Authorization: Bearer <STUDENT-TOKEN>"
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Access denied. Required role: teacher"
}
```

✅ **PASS** - Ako student dobije 403  
❌ **FAIL** - Ako student dobije 200

---

### Test Case 6: Role-Based Access - Teacher Only (Teacher trying) ✅

**Endpoint:** `GET /api/test/teacher-only`  
**Expected:** 200 OK

```bash
# Generiši TEACHER token
node src/utils/generateTestToken.js teacher

# Pristupi teacher-only route
curl -X GET http://localhost:3001/api/test/teacher-only \
  -H "Authorization: Bearer <TEACHER-TOKEN>"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Teacher-only route accessed successfully",
  "user": {
    "userId": "uuid",
    "email": "teacher@test.com",
    "role": "teacher"
  }
}
```

✅ **PASS** - Ako teacher dobije 200  
❌ **FAIL** - Ako teacher dobije 403

---

### Test Case 7: Multiple Roles - Teacher or Parent (Student trying) ❌

**Endpoint:** `GET /api/test/teacher-or-parent`  
**Expected:** 403 Forbidden

```bash
# Koristi STUDENT token
curl -X GET http://localhost:3001/api/test/teacher-or-parent \
  -H "Authorization: Bearer <STUDENT-TOKEN>"
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Access denied. Required role: teacher or parent"
}
```

✅ **PASS** - Ako student dobije 403  
❌ **FAIL** - Ako student dobije 200

---

### Test Case 8: Multiple Roles - Teacher or Parent (Parent trying) ✅

**Endpoint:** `GET /api/test/teacher-or-parent`  
**Expected:** 200 OK

```bash
# Generiši PARENT token
node src/utils/generateTestToken.js parent

# Pristupi route
curl -X GET http://localhost:3001/api/test/teacher-or-parent \
  -H "Authorization: Bearer <PARENT-TOKEN>"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Teacher/Parent route accessed successfully",
  "user": {
    "userId": "uuid",
    "email": "parent@test.com",
    "role": "parent"
  }
}
```

✅ **PASS** - Ako parent dobije 200  
❌ **FAIL** - Ako parent dobije 403

---

### Test Case 9: Dashboard Access (All Roles) ✅

**Endpoint:** `GET /api/test/dashboard`  
**Expected:** 200 OK za sve uloge

```bash
# Test sa student
node src/utils/generateTestToken.js student
curl -X GET http://localhost:3001/api/test/dashboard \
  -H "Authorization: Bearer <STUDENT-TOKEN>"

# Test sa teacher
node src/utils/generateTestToken.js teacher
curl -X GET http://localhost:3001/api/test/dashboard \
  -H "Authorization: Bearer <TEACHER-TOKEN>"

# Test sa parent
node src/utils/generateTestToken.js parent
curl -X GET http://localhost:3001/api/test/dashboard \
  -H "Authorization: Bearer <PARENT-TOKEN>"
```

**Expected Response (za sve):**
```json
{
  "success": true,
  "message": "Welcome to [role] dashboard",
  "user": { ... }
}
```

✅ **PASS** - Ako sve tri uloge dobiju 200  
❌ **FAIL** - Ako bilo koja uloga dobije error

---

## 📊 Test Results Summary

| Test Case | Status | Notes |
|-----------|--------|-------|
| Valid Token | ⬜ | |
| Missing Token | ⬜ | |
| Invalid Token | ⬜ | |
| Expired Token | ⬜ | |
| Teacher-only (Student) | ⬜ | |
| Teacher-only (Teacher) | ⬜ | |
| Multi-role (Student) | ⬜ | |
| Multi-role (Parent) | ⬜ | |
| Dashboard (All Roles) | ⬜ | |

**Legend:**
- ✅ PASS
- ❌ FAIL
- ⬜ Not Tested

---

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot find module 'jsonwebtoken'"
**Solution:**
```bash
cd services/auth
npm install
```

### Issue 2: "JWT_SECRET is not defined"
**Solution:** Kreiraj `.env` fajl sa `JWT_SECRET`

### Issue 3: "ECONNREFUSED" error
**Solution:** Proveri da li je auth service pokrenut (`npm run dev`)

### Issue 4: Token radi u jednom testu ali ne u drugom
**Solution:** Proveri da li je token expired (default 15min). Generiši novi token.

---

## ✅ Acceptance Criteria (from Task BE-003)

- [x] Čita token iz Authorization header-a
- [x] Verifikuje JWT token
- [x] Dodaje user info na request
- [x] Vraća 401 za invalid/expired token
- [x] Role-based middleware radi

---

## 📝 Next Steps

Nakon uspešnih testova:
1. ✅ Mark BE-003 as completed
2. 📝 Notify Backend Developer 1 (može koristiti middleware u BE-001/BE-002)
3. 📝 Notify Frontend Developer 2 (može testirati FE-003 Protected Routes)
4. 🔄 Integration sa BE-001/BE-002 (kada bude implementirano)

---

**Test Plan Created:** 2024  
**Status:** ✅ Ready for Testing

