# JWT Authentication Middleware

## Task BE-003: JWT Authentication Middleware
**Status:** ✅ Completed  
**Developer:** Backend Developer 2  
**Time:** 1 day

---

## 📋 Overview

Ovaj modul implementira JWT (JSON Web Token) autentifikaciju i role-based authorization za LumoLearn platformu.

## 🔧 Komponente

### 1. `authenticateToken()`
Middleware funkcija koja:
- Čita JWT token iz `Authorization: Bearer <token>` header-a
- Verifikuje token koristeći `jwt.verify()`
- Dodaje `req.user` objekat na request sa user info
- Vraća 401 error za invalid/expired/missing token

### 2. `requireRole(allowedRoles)`
Middleware funkcija koja:
- Proverava da li korisnik ima jednu od dozvoljenih uloga
- Mora se koristiti **nakon** `authenticateToken` middleware-a
- Vraća 403 error ako korisnik nema dozvoljenu ulogu

### 3. `generateToken(payload)`
Helper funkcija za generisanje JWT tokena:
- Koristi se u login/register kontrolerima
- Generiše token sa payload-om `{ userId, email, role }`
- Automatski dodaje expiration time

---

## 📦 Installation

Svi potrebni paketi su već instalirani:
```bash
npm install jsonwebtoken @types/jsonwebtoken
```

---

## ⚙️ Configuration

Dodaj sledeće environment varijable u `.env`:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=15m
```

---

## 🚀 Usage Examples

### Primer 1: Protected Route (samo autentifikovani korisnici)

```typescript
import { authenticateToken } from '../middleware/auth';

router.get('/profile', authenticateToken, (req, res) => {
  res.json({
    user: req.user  // { userId, email, role }
  });
});
```

### Primer 2: Role-Based Route (samo teacher)

```typescript
import { authenticateToken, requireRole } from '../middleware/auth';

router.post(
  '/lessons',
  authenticateToken,
  requireRole(['teacher']),
  (req, res) => {
    // Samo teacher može da kreira lekcije
    res.json({ message: 'Lesson created' });
  }
);
```

### Primer 3: Multiple Roles (teacher ili parent)

```typescript
router.get(
  '/student-progress/:id',
  authenticateToken,
  requireRole(['teacher', 'parent']),
  (req, res) => {
    // Teacher i Parent mogu da vide progress studenta
    res.json({ progress: {} });
  }
);
```

### Primer 4: Generate Token (za login/register)

```typescript
import { generateToken } from '../middleware/auth';

// U login ili register kontroleru
const token = generateToken({
  userId: user.id,
  email: user.email,
  role: user.role
});

res.json({ token });
```

---

## 🧪 Testing

### 1. Kreiraj test token

Koristi helper skriptu:
```bash
cd services/auth
node tests/utils/generateTestToken.js student
```

### 2. Test Endpoints

#### Test 1: Valid Token (✅ Trebalo bi da radi)
```bash
curl -X GET http://localhost:3001/api/test/profile \
  -H "Authorization: Bearer <your-token>"
```

**Očekivani odgovor:**
```json
{
  "success": true,
  "message": "Protected route accessed successfully",
  "user": {
    "userId": "uuid",
    "email": "test@test.com",
    "role": "student"
  }
}
```

#### Test 2: Missing Token (❌ 401 Error)
```bash
curl -X GET http://localhost:3001/api/test/profile
```

**Očekivani odgovor:**
```json
{
  "success": false,
  "error": "Access denied. No token provided."
}
```

#### Test 3: Invalid Token (❌ 401 Error)
```bash
curl -X GET http://localhost:3001/api/test/profile \
  -H "Authorization: Bearer invalid-token-123"
```

**Očekivani odgovor:**
```json
{
  "success": false,
  "error": "Invalid token"
}
```

#### Test 4: Role-Based Access - Teacher Only (✅ ako si teacher, ❌ ako nisi)
```bash
curl -X GET http://localhost:3001/api/test/teacher-only \
  -H "Authorization: Bearer <teacher-token>"
```

**Očekivani odgovor (ako si teacher):**
```json
{
  "success": true,
  "message": "Teacher-only route accessed successfully",
  "user": { ... }
}
```

**Očekivani odgovor (ako nisi teacher):**
```json
{
  "success": false,
  "error": "Access denied. Required role: teacher"
}
```

---

## 🔒 Security Notes

1. **JWT_SECRET:** 
   - NIKAD ne commit-uj `.env` fajl u Git
   - Koristi jak, random secret u produkciji (minimum 256 bits)

2. **Token Expiration:**
   - Default: 15 minuta
   - Za produkciju, kombinuj sa refresh token mehanizmom

3. **HTTPS:**
   - U produkciji, UVEK koristi HTTPS za prenos tokena
   - Token može biti ukraden preko man-in-the-middle attack bez HTTPS

4. **XSS Protection:**
   - Ne čuvaj token u localStorage na frontendu (ranjiv na XSS)
   - Preporuka: koristi httpOnly cookies (za produkciju)

---

## 📝 Acceptance Criteria

- [x] Čita token iz Authorization header-a
- [x] Verifikuje JWT token
- [x] Dodaje user info na request objekat
- [x] Vraća 401 za invalid/expired token
- [x] Role-based middleware radi
- [x] Error handling za sve edge cases
- [x] TypeScript type definitions
- [x] Test routes za demonstraciju

---

## 🐛 Troubleshooting

### Error: "JWT_SECRET is not defined"
**Rešenje:** Kreiraj `.env` fajl ili kopiraj `.env.example`:
```bash
cp .env.example .env
```

### Error: "Invalid token"
**Rešenje:** 
1. Proveri da li token počinje sa "Bearer "
2. Koristi `tests/utils/generateTestToken.js` da kreirš validan token
3. Proveri da li je token expired (default 15min)

### Error: "Authentication required" (kod requireRole)
**Rešenje:** Stavi `authenticateToken` middleware **PRE** `requireRole`

---

## 📚 Resources

- [JWT.io](https://jwt.io/) - Debug JWT tokena
- [jsonwebtoken npm](https://www.npmjs.com/package/jsonwebtoken) - Dokumentacija paketa
- [Express Middleware Guide](https://expressjs.com/en/guide/using-middleware.html)

---

**Created:** 2024  
**Last Updated:** 2024  
**Status:** ✅ Ready for Integration

