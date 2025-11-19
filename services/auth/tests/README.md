# 🧪 Tests - Auth Service

## 📁 Folder Structure

```
tests/
├── scripts/           # Automated test scripts
│   └── test-middleware.ps1
├── utils/             # Test utilities
│   └── generateTestToken.js
├── docs/              # Test documentation
│   └── TEST_BE-003.md
├── examples/          # Code examples & templates
│   └── testRoutes.example.ts
└── README.md          # This file
```

---

## 🚀 Quick Start

### 1. Generate Test Token
```bash
node tests/utils/generateTestToken.js student
node tests/utils/generateTestToken.js teacher
node tests/utils/generateTestToken.js parent
```

### 2. Run Automated Tests
```powershell
# From services/auth directory
.\tests\scripts\test-middleware.ps1
```

### 3. Manual Testing
See `tests/docs/TEST_BE-003.md` for detailed curl commands and test cases.

---

## 📂 What's in Each Folder?

### `/scripts/` - Automated Test Scripts
**`test-middleware.ps1`** - PowerShell script that automatically tests JWT middleware
- Runs 9 test cases
- Tests authentication, authorization, and role-based access
- Outputs pass/fail results with success rate

**Usage:**
```powershell
.\tests\scripts\test-middleware.ps1
```

---

### `/utils/` - Test Utilities
**`generateTestToken.js`** - Generates JWT test tokens for development

**Usage:**
```bash
# Generate token for specific role
node tests/utils/generateTestToken.js student
node tests/utils/generateTestToken.js teacher
node tests/utils/generateTestToken.js parent

# With custom email
node tests/utils/generateTestToken.js teacher teacher@example.com
```

**Output:**
- JWT token string
- Decoded payload
- Example curl commands
- Expiry time

---

### `/docs/` - Test Documentation
**`TEST_BE-003.md`** - Comprehensive test plan for Task BE-003
- 9 detailed test cases
- Expected responses
- Manual testing instructions with curl commands
- Troubleshooting guide

---

### `/examples/` - Code Examples & Templates
**`testRoutes.example.ts`** - Example protected routes for testing middleware

This is a template showing how to:
- Protect routes with `authenticateToken`
- Use role-based access with `requireRole`
- Handle different authentication scenarios

**Note:** This is for reference only. Actual protected routes should be in `src/routes/`

---

## 🧪 Test Cases Overview

| # | Test Case | Expected Result |
|---|-----------|-----------------|
| 1 | Valid token | 200 OK ✅ |
| 2 | Missing token | 401 Unauthorized ❌ |
| 3 | Invalid token | 401 Unauthorized ❌ |
| 4 | Expired token | 401 Unauthorized ❌ |
| 5 | Teacher-only (Student trying) | 403 Forbidden ❌ |
| 6 | Teacher-only (Teacher trying) | 200 OK ✅ |
| 7 | Multi-role (Student trying) | 403 Forbidden ❌ |
| 8 | Multi-role (Parent trying) | 200 OK ✅ |
| 9 | Dashboard (All roles) | 200 OK ✅ |

---

## 🔧 Configuration

### Environment Variables Required
```env
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
PORT=3001
```

### Prerequisites
- Auth service running on port 3001
- `.env` file configured
- Node.js installed

---

## 📝 Common Tasks

### Generate Token for Frontend Testing
```bash
# Generate and save token
node tests/utils/generateTestToken.js student > token.txt

# Or copy from output
node tests/utils/generateTestToken.js teacher
```

### Test Specific Endpoint
```bash
# 1. Generate token
TOKEN=$(node tests/utils/generateTestToken.js student | grep "eyJ")

# 2. Test endpoint
curl -X GET http://localhost:3001/api/test/profile \
  -H "Authorization: Bearer $TOKEN"
```

### Run All Tests
```powershell
# PowerShell
.\tests\scripts\test-middleware.ps1

# Expected output:
# ✅ Passed: 9/9
# ❌ Failed: 0/9
# Success Rate: 100%
```

---

## 🐛 Troubleshooting

### "Cannot find module" error
```bash
# Make sure you're in the correct directory
cd services/auth

# Check if file exists
ls tests/utils/generateTestToken.js
```

### "Auth service not running" error
```bash
# Start auth service in another terminal
npm run dev
```

### Token expired
```bash
# Generate new token (default expiry: 15m)
node tests/utils/generateTestToken.js student
```

### PowerShell execution policy error
```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

---

## 📚 Related Documentation

- **Middleware Usage:** `../src/middleware/README.md`
- **Service Overview:** `../README.md`
- **Test Plan Details:** `docs/TEST_BE-003.md`
- **Main Project Tasks:** `../../MVP_TASKS.md`

---

## 🎯 When to Use These Tests

### During Development
- ✅ After implementing new protected routes
- ✅ When debugging authentication issues
- ✅ Before committing middleware changes
- ✅ When testing frontend integration

### Before Deployment
- ✅ Run full test suite (`test-middleware.ps1`)
- ✅ Verify all test cases pass
- ✅ Test with different roles
- ✅ Check error handling

### For New Developers
- ✅ Run tests to understand how middleware works
- ✅ Use `generateTestToken.js` to test protected routes
- ✅ Read `TEST_BE-003.md` for detailed examples
- ✅ Check `testRoutes.example.ts` for code patterns

---

## 🔐 Security Notes

- ⚠️ Test tokens are for **DEVELOPMENT ONLY**
- ⚠️ Never commit `.env` file with real secrets
- ⚠️ Test utilities should not be used in production
- ⚠️ Always use HTTPS in production

---

## 🤝 Contributing

When adding new tests:
1. Add test script to `scripts/`
2. Add documentation to `docs/`
3. Update this README
4. Follow existing naming conventions

---

## 📊 Test Coverage

### Middleware Functions Tested
- ✅ `authenticateToken()` - All scenarios
- ✅ `requireRole()` - Single and multiple roles
- ✅ Error handling - 401, 403, 500
- ✅ Token validation - Valid, invalid, expired, missing

### Not Tested (Out of Scope)
- ❌ User registration/login (BE-001, BE-002)
- ❌ Database operations
- ❌ Password hashing
- ❌ Email validation

---

**Last Updated:** November 19, 2024  
**Task:** BE-003 - JWT Authentication Middleware  
**Status:** ✅ Completed

