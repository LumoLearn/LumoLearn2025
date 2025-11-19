# 🚀 Quick Start - Testing Auth Middleware

## 1️⃣ Generate a Test Token (30 seconds)

```bash
# From services/auth directory
node tests/utils/generateTestToken.js student
```

**Output will look like:**
```
🔑 Token:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQi...

📝 Example Usage:
curl -X GET http://localhost:3001/api/test/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI..."
```

**Copy the token** (starts with `eyJ...`)

---

## 2️⃣ Start Auth Service

```bash
# In services/auth directory
npm run dev
```

Wait for: `Auth service running on port 3001`

---

## 3️⃣ Test the Middleware

### Option A: Automated (Recommended)
```powershell
.\tests\scripts\test-middleware.ps1
```

**Expected output:**
```
✅ Passed: 9/9
❌ Failed: 0/9
Success Rate: 100%
🎉 ALL TESTS PASSED!
```

### Option B: Manual with curl
```bash
# Replace <TOKEN> with your generated token
curl -X GET http://localhost:3001/api/test/profile \
  -H "Authorization: Bearer <TOKEN>"
```

**Expected response:**
```json
{
  "success": true,
  "message": "Protected route accessed successfully",
  "user": {
    "userId": "...",
    "email": "student@test.com",
    "role": "student"
  }
}
```

---

## 📚 Next Steps

- **Detailed tests:** See `tests/docs/TEST_BE-003.md`
- **Code examples:** See `tests/examples/testRoutes.example.ts`
- **Middleware usage:** See `../src/middleware/README.md`

---

## 🐛 Troubleshooting

### "Auth service not running"
```bash
cd services/auth
npm run dev
```

### "JWT_SECRET not defined"
```bash
# Create .env file
echo "JWT_SECRET=dev-secret-key" > .env
echo "JWT_EXPIRES_IN=15m" >> .env
echo "PORT=3001" >> .env
```

### Token expired
```bash
# Generate new token (expires in 15m)
node tests/utils/generateTestToken.js student
```

---

**That's it! You're ready to test the JWT middleware! 🎉**

