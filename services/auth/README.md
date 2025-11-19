# Auth Service - LumoLearn

## 🔐 Overview

Authentication service za LumoLearn platformu. Pruža JWT-based autentifikaciju i autorizaciju za sve tipove korisnika (student, teacher, parent).

**Port:** 3001  
**Database:** PostgreSQL

---

## 📦 Features

### ✅ Completed
- **BE-003:** JWT Authentication Middleware
  - `authenticateToken()` - JWT token verification
  - `requireRole()` - Role-based authorization
  - `generateToken()` - Token generation helper
  - TypeScript type definitions
  - Test routes i utilities

### 🔨 In Progress
- **BE-001:** User Registration Endpoint (Backend Developer 1)
- **BE-002:** User Login Endpoint (Backend Developer 1)

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
# Kreiraj .env fajl
cp .env.example .env

# Obavezne varijable:
PORT=3001
DATABASE_URL=postgresql://lumolearn:dev_pass@localhost:5432/lumolearn
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=15m
```

### 3. Run Development Server
```bash
npm run dev
```

Server će biti dostupan na `http://localhost:3001`

### 4. Test Health
```bash
curl http://localhost:3001/health
```

---

## 🧪 Testing JWT Middleware

### Option 1: Automated Tests (PowerShell)
```bash
# U novom terminalu (server mora biti pokrenut)
.\tests\scripts\test-middleware.ps1
```

### Option 2: Manual Testing
```bash
# 1. Generiši test token
node tests/utils/generateTestToken.js student

# 2. Test protected route
curl -X GET http://localhost:3001/api/test/profile \
  -H "Authorization: Bearer <your-token>"
```

---

## 📚 API Endpoints

### Health Check
```
GET /health - Health check
GET /health/db - Database connection check
```

### Auth Endpoints (Coming Soon - BE-001, BE-002)
```
POST /api/auth/register - User registration
POST /api/auth/login - User login
```

### Test Endpoints (BE-003 - For Testing Only)
**See:** `tests/examples/testRoutes.example.ts` for implementation examples
```
GET /api/test/profile - Protected route (all roles)
GET /api/test/teacher-only - Teacher-only route
GET /api/test/teacher-or-parent - Teacher/Parent route
GET /api/test/dashboard - Dashboard (all roles)
```

---

## 🔧 Using JWT Middleware

### Protect a Route (All Authenticated Users)
```typescript
import { authenticateToken } from './middleware/auth';

router.get('/profile', authenticateToken, (req, res) => {
  // req.user je dostupan ovde
  res.json({ user: req.user });
});
```

### Role-Based Protection
```typescript
import { authenticateToken, requireRole } from './middleware/auth';

// Samo teacher
router.post('/lessons', 
  authenticateToken, 
  requireRole(['teacher']), 
  createLesson
);

// Teacher ili Parent
router.get('/student-progress/:id',
  authenticateToken,
  requireRole(['teacher', 'parent']),
  getProgress
);
```

### Generate Token (For Login/Register)
```typescript
import { generateToken } from './middleware/auth';

const token = generateToken({
  userId: user.id,
  email: user.email,
  role: user.role
});

res.json({ token });
```

---

## 📁 Project Structure

```
services/auth/
├── src/
│   ├── config/
│   │   └── database.ts          # PostgreSQL connection
│   ├── controllers/             # Route handlers
│   ├── middleware/
│   │   ├── auth.ts              # ✅ JWT middleware (BE-003)
│   │   └── README.md            # Middleware documentation
│   ├── models/                  # Database models
│   ├── routes/
│   │   └── authRoutes.ts        # Auth routes (BE-001, BE-002)
│   ├── services/                # Business logic
│   ├── types/
│   │   └── express.d.ts         # ✅ TypeScript definitions
│   └── index.ts                 # Main app
├── tests/                       # ✅ Test files (organized)
│   ├── scripts/
│   │   └── test-middleware.ps1  # Automated tests
│   ├── utils/
│   │   └── generateTestToken.js # Token generator
│   ├── docs/
│   │   └── TEST_BE-003.md       # Test plan
│   ├── examples/
│   │   └── testRoutes.example.ts # Example routes
│   └── README.md                # Test documentation
├── .env                         # Environment variables
├── .env.example                 # Environment template
├── package.json
├── tsconfig.json
└── README.md                    # This file
```

---

## 🔗 Dependencies

### Production
- `express` - Web framework
- `jsonwebtoken` - JWT implementation
- `bcrypt` - Password hashing (for BE-001, BE-002)
- `pg` - PostgreSQL client
- `express-validator` - Input validation
- `dotenv` - Environment variables
- `cors` - CORS middleware
- `helmet` - Security headers

### Development
- `typescript` - Type safety
- `ts-node` - TypeScript execution
- `nodemon` - Auto-reload

---

## 📖 Documentation

### Task-Specific Documentation:
- **BE-003:** `src/middleware/README.md` - JWT middleware guide
- **BE-003:** `tests/README.md` - Test documentation
- **BE-003:** `tests/docs/TEST_BE-003.md` - Detailed test plan
- **BE-003:** `tests/examples/testRoutes.example.ts` - Code examples

### General Documentation:
- `../../MVP_TASKS.md` - All MVP tasks
- `../../README.md` - Project overview

---

## 🔒 Security

### JWT Configuration
- **Secret:** Promeni `JWT_SECRET` u produkciji (minimum 256 bits)
- **Expiration:** Default 15m (konfigurabilno)
- **Algorithm:** HS256 (HMAC with SHA-256)

### Best Practices
- ⚠️ NIKAD ne commit-uj `.env` fajl
- ⚠️ Koristi HTTPS u produkciji
- ⚠️ Validuj sve user input-e
- ⚠️ Sanitizuj output-e (XSS protection)
- ⚠️ Razmotri rate limiting (brute-force protection)

---

## 🐛 Troubleshooting

### "Cannot find module" error
```bash
npm install
```

### "JWT_SECRET is not defined"
```bash
# Proveri .env fajl
cat .env

# Ili kreiraj novi
cp .env.example .env
```

### "ECONNREFUSED" (Database)
```bash
# Proveri da li je PostgreSQL pokrenut
# Proveri DATABASE_URL u .env
```

### Port already in use
```bash
# Promeni PORT u .env
PORT=3002
```

---

## 📝 Scripts

```bash
npm run dev      # Start development server (nodemon)
npm run build    # Build TypeScript
npm start        # Start production server
npm test         # Run tests (coming soon)
```

---

## 🎯 Next Steps

1. ✅ **BE-003 Completed** - JWT middleware ready
2. ⏳ **BE-001** - Implement registration endpoint
3. ⏳ **BE-002** - Implement login endpoint
4. ⏳ **Integration** - Connect BE-001/BE-002 with middleware

---

## 👥 Team

- **Backend Developer 1:** BE-001 (Registration), BE-002 (Login)
- **Backend Developer 2:** ✅ BE-003 (JWT Middleware) - COMPLETED

---

## 📞 Support

- **Issues:** Check troubleshooting section above
- **Documentation:** `src/middleware/README.md` for middleware details
- **Testing:** Run `.\test-middleware.ps1` for automated tests

---

**Service Version:** 1.0.0  
**Last Updated:** November 19, 2024  
**Status:** 🟢 Active Development

