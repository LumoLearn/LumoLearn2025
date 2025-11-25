# Test Documentation - Task BE-006: Student Accessibility Settings Endpoint

**Task:** BE-006  
**Developer:** Backend Developer 2  
**Priority:** P1 (Critical)  
**Status:** ✅ Implemented  
**Date:** 2024-11-24

---

## 📋 Overview

Implementiran GET/PUT `/api/students/:id/settings` endpoint za accessibility settings.

### Implementovani fajlovi:
- ✅ `src/controllers/studentController.ts` - Controller sa getSettings i updateSettings funkcijama
- ✅ `src/routes/studentRoutes.ts` - Routes sa GET/PUT endpoint-ima
- ✅ `src/middleware/validation.ts` - Validacija za accessibility settings
- ✅ `src/index.ts` - Registrovane student routes

---

## 🔍 Implementacija

### 1. Controller (`studentController.ts`)

#### `getSettings()` funkcija:
- Dohvata accessibility settings za studenta
- Autorizacija: Student može pristupiti samo svojim settings-ima
- TODO: Dodati parent autorizaciju kada se implementira parent-student relacija
- Vraća default settings ako nisu postavljeni

#### `updateSettings()` funkcija:
- Update-uje accessibility settings
- Merge-uje postojeće settings sa novim (partial update)
- Autorizacija: Samo student može update-ovati svoje settings

### 2. Routes (`studentRoutes.ts`)

```typescript
GET  /api/students/:id/settings  - Protected (student, parent)
PUT  /api/students/:id/settings  - Protected (student only)
```

### 3. Validation

Validacija za accessibility settings:
- `font_family`: String, mora biti jedan od: Arial, OpenDyslexic, Comic Sans MS, Verdana, Times New Roman, Georgia
- `font_size`: Integer, 12-24
- `line_spacing`: Float, 1.0-3.0
- `letter_spacing`: Float, 0-0.2
- `text_color`: Hex color format (#000000)
- `background_color`: Hex color format (#FFFFFF)

Sva polja su opciona (partial update).

---

## 🧪 Test Cases

### Preduslovi:
1. Auth service mora biti pokrenut (port 3001)
2. PostgreSQL baza mora biti pokrenuta
3. Potreban je validan JWT token za studenta

### Setup:

```bash
# 1. Pokreni Docker servise (PostgreSQL)
cd D:\Fajlovi\LumoLearn\LumoLearn2025
docker compose up -d

# 2. Pokreni Auth service
cd services/auth
npm run dev
```

---

## 📝 Test Scenarios

### Test 1: Register Student User

```bash
# Registruj novog studenta
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"student1@test.com\",\"password\":\"Test1234!\",\"role\":\"student\",\"firstName\":\"Marko\",\"lastName\":\"Markovic\"}"
```

**Expected Response (201):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "student1@test.com",
    "role": "student"
  }
}
```

**Sačuvaj token i user.id za sledeće testove!**

---

### Test 2: Get Default Accessibility Settings

```bash
# Zameni <TOKEN> sa tokenom iz Test 1
# Zameni <STUDENT_ID> sa user.id iz Test 1

curl -X GET http://localhost:3001/api/students/<STUDENT_ID>/settings \
  -H "Authorization: Bearer <TOKEN>"
```

**Expected Response (200):**
```json
{
  "success": true,
  "settings": {
    "font_family": "Arial",
    "font_size": 16,
    "line_spacing": 1.5,
    "letter_spacing": 0,
    "text_color": "#000000",
    "background_color": "#FFFFFF"
  }
}
```

---

### Test 3: Update Accessibility Settings (Full Update)

```bash
curl -X PUT http://localhost:3001/api/students/<STUDENT_ID>/settings \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d "{\"font_family\":\"OpenDyslexic\",\"font_size\":18,\"line_spacing\":2.0,\"letter_spacing\":0.12,\"text_color\":\"#000000\",\"background_color\":\"#FAFAC8\"}"
```

**Expected Response (200):**
```json
{
  "success": true,
  "settings": {
    "font_family": "OpenDyslexic",
    "font_size": 18,
    "line_spacing": 2.0,
    "letter_spacing": 0.12,
    "text_color": "#000000",
    "background_color": "#FAFAC8"
  }
}
```

---

### Test 4: Update Accessibility Settings (Partial Update)

```bash
# Update samo font_size i background_color
curl -X PUT http://localhost:3001/api/students/<STUDENT_ID>/settings \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d "{\"font_size\":20,\"background_color\":\"#F0F0F0\"}"
```

**Expected Response (200):**
```json
{
  "success": true,
  "settings": {
    "font_family": "OpenDyslexic",
    "font_size": 20,
    "line_spacing": 2.0,
    "letter_spacing": 0.12,
    "text_color": "#000000",
    "background_color": "#F0F0F0"
  }
}
```

---

### Test 5: Validation Error - Invalid Font Size

```bash
curl -X PUT http://localhost:3001/api/students/<STUDENT_ID>/settings \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d "{\"font_size\":50}"
```

**Expected Response (400):**
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": [
    {
      "field": "font_size",
      "message": "Font size must be between 12 and 24"
    }
  ]
}
```

---

### Test 6: Validation Error - Invalid Hex Color

```bash
curl -X PUT http://localhost:3001/api/students/<STUDENT_ID>/settings \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d "{\"text_color\":\"red\"}"
```

**Expected Response (400):**
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": [
    {
      "field": "text_color",
      "message": "Text color must be a valid hex color (e.g., #000000)"
    }
  ]
}
```

---

### Test 7: Authorization Error - Access Other Student's Settings

```bash
# Register drugi student
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"student2@test.com\",\"password\":\"Test1234!\",\"role\":\"student\",\"firstName\":\"Ana\",\"lastName\":\"Anic\"}"

# Sačuvaj token2 i student2_id

# Pokušaj pristupa settings-ima prvog studenta sa tokenom drugog studenta
curl -X GET http://localhost:3001/api/students/<STUDENT_ID>/settings \
  -H "Authorization: Bearer <TOKEN2>"
```

**Expected Response (403):**
```json
{
  "success": false,
  "error": "Access denied. You can only access your own settings."
}
```

---

### Test 8: Authentication Error - Missing Token

```bash
curl -X GET http://localhost:3001/api/students/<STUDENT_ID>/settings
```

**Expected Response (401):**
```json
{
  "success": false,
  "error": "Access denied. No token provided."
}
```

---

### Test 9: Authentication Error - Invalid Token

```bash
curl -X GET http://localhost:3001/api/students/<STUDENT_ID>/settings \
  -H "Authorization: Bearer invalid-token-123"
```

**Expected Response (401):**
```json
{
  "success": false,
  "error": "Invalid token"
}
```

---

### Test 10: Not Found Error - Non-existent Student

```bash
curl -X GET http://localhost:3001/api/students/00000000-0000-0000-0000-000000000000/settings \
  -H "Authorization: Bearer <TOKEN>"
```

**Expected Response (404):**
```json
{
  "success": false,
  "error": "Student not found"
}
```

---

### Test 11: Preset - Dyslexia Friendly Settings

```bash
curl -X PUT http://localhost:3001/api/students/<STUDENT_ID>/settings \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d "{\"font_family\":\"OpenDyslexic\",\"font_size\":18,\"line_spacing\":2.0,\"letter_spacing\":0.12,\"text_color\":\"#000000\",\"background_color\":\"#FAFAC8\"}"
```

---

### Test 12: Preset - Visual Impairment Settings

```bash
curl -X PUT http://localhost:3001/api/students/<STUDENT_ID>/settings \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d "{\"font_family\":\"Arial\",\"font_size\":24,\"line_spacing\":2.5,\"letter_spacing\":0.1,\"text_color\":\"#000000\",\"background_color\":\"#FFFF00\"}"
```

---

### Test 13: Reset to Default Settings

```bash
curl -X PUT http://localhost:3001/api/students/<STUDENT_ID>/settings \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d "{\"font_family\":\"Arial\",\"font_size\":16,\"line_spacing\":1.5,\"letter_spacing\":0,\"text_color\":\"#000000\",\"background_color\":\"#FFFFFF\"}"
```

---

## ✅ Acceptance Criteria

- [x] Validacija JSONB strukture
- [x] GET endpoint vraća settings
- [x] PUT endpoint update-uje settings
- [x] Partial update radi (merge sa postojećim settings-ima)
- [x] Vraća updated settings nakon save-a
- [x] Autentifikacija radi (JWT token required)
- [x] Autorizacija radi (student može pristupiti samo svojim settings-ima)
- [x] Validacija svih polja (font_family, font_size, line_spacing, letter_spacing, text_color, background_color)
- [x] Error handling za sve edge cases
- [x] Default settings se vraćaju ako nisu postavljeni

---

## 🔄 Integration Points

### Frontend Integration (Task FE-005):
- Frontend će koristiti ove endpoint-e za:
  - Učitavanje trenutnih settings-a
  - Update settings-a
  - Preset buttons (Dyslexia Friendly, Visual Impairment, Default)
  - Live preview

### Future Integration:
- Parent dashboard će moći da vidi settings svoje dece (GET endpoint sa parent autorizacijom)
- Settings će se primenjivati na lesson viewer (Task FE-008)

---

## 📊 Database Schema

```sql
-- students tabela (već postoji)
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  accessibility_settings JSONB DEFAULT '{
    "font_family": "Arial",
    "font_size": 16,
    "line_spacing": 1.5,
    "letter_spacing": 0,
    "text_color": "#000000",
    "background_color": "#FFFFFF"
  }'::jsonb
);
```

---

## 🐛 Known Issues / TODO

- [ ] Parent autorizacija još nije implementirana (čeka Task BE-016)
- [ ] Teacher ne može pristupiti student settings-ima (možda će biti potrebno u budućnosti)

---

## 📚 Related Tasks

- **BE-001, BE-002, BE-003:** Authentication (dependency)
- **FE-005:** Accessibility Settings Page (frontend implementation)
- **FE-008:** Lesson Viewer (koristi ove settings)
- **BE-016:** Parent-Student Link (parent autorizacija)

---

## 🎉 Status

**✅ TASK BE-006 COMPLETED**

Svi endpoint-i su implementirani, testirani i dokumentovani.
Spremno za frontend integraciju (Task FE-005).

---

**Implementirao:** Backend Developer 2  
**Datum:** 2024-11-24  
**Vreme implementacije:** 1.5 dana (prema planu)

