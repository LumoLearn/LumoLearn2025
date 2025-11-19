# LumoLearn MVP - Detaljni Taskovi za Implementaciju

## 📋 Pregled

**Timeline:** 12 nedelja (3 meseca)  
**Tim:** 4 developera (2 Frontend + 2 Backend)  
**Cilj:** Funkcionalna MVP platforma za teacher, student, parent

---

## 🎯 Sprint Plan (12 nedelja)

| Nedelja | Fokus | Frontend | Backend |
|---------|-------|----------|---------|
| 1-2 | Authentication | Login/Register UI | Auth API |
| 3-4 | Profiles | Profile pages | Profile API |
| 5-6 | Lessons | Upload & Viewer | Content Service |
| 7-8 | AI Quizzes | Quiz Generator UI | AI Service + Quiz API |
| 9-10 | Student Flow | Quiz Taker | Quiz Submission |
| 11-12 | Parent Dashboard | Dashboard UI | Analytics API |

---

## 🔗 Task Dependencies & Parallel Work

### Kako čitati zavisnosti:
- ✅ **Može paralelno** - Taskovi se mogu raditi istovremeno
- ⚠️ **Delimična zavisnost** - Može se raditi paralelno, ali testiranje zahteva završetak drugog taska
- ❌ **Zavisi od** - Ne može se početi dok se drugi task ne završi

### Sprint 1-2: Authentication

#### Backend:
- ✅ **BE-001 (Registration)** i **BE-002 (Login)** - **MOGU PARALELNO**
  - Oba koriste JWT za generisanje tokena
  - Nema međusobne zavisnosti
  - Developer 1 može da radi oba sekvencijalno ili paralelno (ako ima vremena)

- ⚠️ **BE-003 (JWT Middleware)** - **MOŽE PARALELNO SA BE-001/BE-002**
  - **Implementacija:** Može da se radi paralelno (zna se JWT format: `{ userId, email, role }`)
  - **Testiranje:** Zahteva završene BE-001 ili BE-002 (treba validan token za testiranje)
  - **Preporuka:** Developer 2 može da počne BE-003 istovremeno, ali će testiranje biti na kraju kada Developer 1 završi BE-001 ili BE-002

#### Frontend:
- ✅ **FE-001 (Login UI)** i **FE-002 (Register UI)** - **MOGU PARALELNO**
  - Nema zavisnosti između njih
  - Frontend Developer 1 može da ih radi paralelno ili sekvencijalno

- ❌ **FE-003 (Protected Routes)** - **ZAVISI OD BE-003**
  - Frontend Developer 2 može da počne strukturu, ali za testiranje treba BE-003 middleware
  - **Preporuka:** Počni sa osnovnom strukturom, završi testiranje nakon BE-003

### Sprint 3-4: Profiles

#### Backend:
- ✅ **BE-004 (Get Profile)** i **BE-005 (Update Profile)** - **MOGU PARALELNO**
  - Oba koriste isti model i strukturu
  - Nema međusobne zavisnosti

- ✅ **BE-006 (Accessibility Settings)** - **MOŽE PARALELNO SA BE-004/BE-005**
  - Različita tabela i logika
  - Nema zavisnosti

#### Frontend:
- ✅ **FE-004 (Profile Page)** i **FE-005 (Settings Page)** - **MOGU PARALELNO**
  - Različite stranice, nema zavisnosti

### Sprint 5-6: Lessons

#### Backend:
- ❌ **BE-007 (Content Service Setup)** - **PRVO**
  - BE-008 i BE-009 zavise od ovog (treba service da postoji)

- ❌ **BE-008 (Upload)** i **BE-009 (Get Lessons)** - **ZAVISE OD BE-007**
  - Mogu se raditi paralelno nakon BE-007

- ⚠️ **BE-010 (Publish)** - **ZAVISI OD BE-009**
  - Zahteva da GET endpoint postoji (za proveru)

#### Frontend:
- ❌ **FE-006 (Upload UI)** - **ZAVISI OD BE-008**
  - Ne može se testirati bez backend endpoint-a

- ⚠️ **FE-007 (List UI)** - **ZAVISI OD BE-009**
  - Može se napraviti UI struktura, ali testiranje zahteva BE-009

- ❌ **FE-008 (Viewer)** - **ZAVISI OD BE-009**
  - Ne može se testirati bez lesson content-a

### Sprint 7-8: AI Quizzes

#### Backend:
- ❌ **BE-011 (AI Service Setup)** - **PRVO**
  - BE-012 zavisi od ovog

- ❌ **BE-012 (Quiz Generation)** - **ZAVISI OD BE-011**
  - Ne može se raditi bez AI service-a

- ⚠️ **BE-013 (Quiz CRUD)** - **MOŽE PARALELNO SA BE-012**
  - Različita logika, ali zavisi od BE-011 (Content Service)

#### Frontend:
- ❌ **FE-009 (Generator UI)** - **ZAVISI OD BE-012**
  - Ne može se testirati bez AI endpoint-a

- ❌ **FE-010 (Editor UI)** - **ZAVISI OD BE-013**
  - Ne može se testirati bez CRUD endpoint-a

### Sprint 9-10: Student Flow

#### Backend:
- ✅ **BE-014 (Quiz Submission)** i **BE-015 (Get Published)** - **MOGU PARALELNO**
  - Različiti endpoint-i, nema zavisnosti

#### Frontend:
- ⚠️ **FE-011 (Lessons List)** - **ZAVISI OD BE-015**
  - Može se napraviti UI struktura, testiranje zahteva BE-015

- ❌ **FE-012 (Quiz Taker)** - **ZAVISI OD BE-014**
  - Ne može se testirati bez submission endpoint-a

### Sprint 11-12: Parent Dashboard

#### Backend:
- ✅ **BE-016 (Link Student)** i **BE-017 (Progress)** - **MOGU PARALELNO**
  - Različita logika, nema zavisnosti

#### Frontend:
- ❌ **FE-013 (Parent Dashboard)** - **ZAVISI OD BE-016 I BE-017**
  - Ne može se testirati bez oba endpoint-a

---

## 📊 Preporučeni Redosled Rada (Sprint 1-2 Primer)

### Dan 1-2:
- **Backend Developer 1:** BE-001 (Registration) - 2 dana
- **Backend Developer 2:** BE-003 (JWT Middleware) - implementacija (1 dan) + čeka testiranje
- **Frontend Developer 1:** FE-001 (Login UI) - 2 dana
- **Frontend Developer 2:** FE-002 (Register UI) - 2 dana

### Dan 3-4:
- **Backend Developer 1:** BE-002 (Login) - 1.5 dana + testiranje BE-003 sa tokenom
- **Backend Developer 2:** Testiranje BE-003 sa tokenom iz BE-001/BE-002
- **Frontend Developer 1:** FE-002 (Register UI) - ako nije završio
- **Frontend Developer 2:** FE-003 (Protected Routes) - struktura + testiranje nakon BE-003

### Rezultat:
- **Paralelizam:** 4 developera rade istovremeno
- **Efikasnost:** Maksimalno iskorišćenje vremena
- **Testiranje:** Sinhronizovano na kraju

---

# 🔐 SPRINT 1-2: AUTHENTICATION (Nedelja 1-2)

## BACKEND TASKS

### Task BE-001: User Registration Endpoint
**Dodeljeno:** Backend Developer 1  
**Prioritet:** P1 (Critical)  
**Vreme:** 2 dana

#### Opis
Implementirati POST `/api/auth/register` endpoint koji kreira novog korisnika sa jednom od 3 uloge (student, teacher, parent).

#### Instrukcije
1. **Kreiraj validation middleware:**
   - `src/middleware/validation.ts`
   - Koristi `express-validator`
   - Validacija: email (format), password (min 8 karaktera), role (student/teacher/parent)

2. **Kreiraj User model:**
   - `src/models/User.ts`
   - Funkcije: `createUser()`, `findByEmail()`
   - Hash password sa `bcrypt` (10 rounds)

3. **Kreiraj auth controller:**
   - `src/controllers/authController.ts`
   - `register()` funkcija:
     - Validira input
     - Proveri da li email već postoji
     - Hash password
     - Kreira user u `users` tabeli
     - Kreira odgovarajući role record (students/teachers/parents tabela)
     - Kreira osnovni profile record
     - Vrati JWT token

4. **Update routes:**
   - `src/routes/authRoutes.ts`
   - Dodaj `POST /register` sa validation middleware

#### Request Body
```json
{
  "email": "student@test.com",
  "password": "Test1234!",
  "role": "student",
  "firstName": "Marko",
  "lastName": "Marković"
}
```

#### Response (Success - 201)
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "student@test.com",
    "role": "student"
  }
}
```

#### Response (Error - 400)
```json
{
  "success": false,
  "error": "Email already exists"
}
```

#### Acceptance Criteria
- [ ] Validacija email formata
- [ ] Validacija password (min 8 karaktera)
- [ ] Validacija role (samo student/teacher/parent)
- [ ] Email mora biti unique
- [ ] Password se hash-uje pre čuvanja
- [ ] Kreira se user + role record + profile
- [ ] Vraća JWT token
- [ ] Error handling za sve edge cases

#### Test Cases
```bash
# Test 1: Valid registration
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test1234!","role":"student","firstName":"Test","lastName":"User"}'

# Test 2: Duplicate email
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@test.com","password":"Test1234!","role":"teacher","firstName":"Test","lastName":"User"}'

# Test 3: Invalid email
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid-email","password":"Test1234!","role":"student","firstName":"Test","lastName":"User"}'
```

---

### Task BE-002: User Login Endpoint
**Dodeljeno:** Backend Developer 1  
**Prioritet:** P1 (Critical)  
**Vreme:** 1.5 dana

#### Opis
Implementirati POST `/api/auth/login` endpoint koji autentifikuje korisnika i vraća JWT token.

#### Instrukcije
1. **Kreiraj login funkciju u controller:**
   - `src/controllers/authController.ts`
   - `login()` funkcija:
     - Validira email i password
     - Pronađi user po email-u
     - Poredi password sa `bcrypt.compare()`
     - Generiši JWT token (koristi `jsonwebtoken`)
     - Vrati token + user info

2. **JWT Configuration:**
   - Koristi `JWT_SECRET` iz `.env`
   - Expiration: `JWT_EXPIRES_IN` (15m)
   - Payload: `{ userId, email, role }`

3. **Update routes:**
   - Dodaj `POST /login` sa validation middleware

#### Request Body
```json
{
  "email": "student@test.com",
  "password": "Test1234!"
}
```

#### Response (Success - 200)
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "student@test.com",
    "role": "student"
  }
}
```

#### Response (Error - 401)
```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

#### Acceptance Criteria
- [ ] Validacija email i password
- [ ] Provera da user postoji
- [ ] Password verification sa bcrypt
- [ ] JWT token generation
- [ ] Vraća user info sa tokenom
- [ ] Error handling za invalid credentials

#### Test Cases
```bash
# Test 1: Valid login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@test.com","password":"Test1234!"}'

# Test 2: Invalid password
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@test.com","password":"WrongPassword"}'

# Test 3: Non-existent user
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"nonexistent@test.com","password":"Test1234!"}'
```

---

### Task BE-003: JWT Authentication Middleware
**Dodeljeno:** Backend Developer 2  
**Prioritet:** P1 (Critical)  
**Vreme:** 1 dan

#### Opis
Kreirati middleware za verifikaciju JWT tokena i zaštitu protected routes.

#### Instrukcije
1. **Kreiraj auth middleware:**
   - `src/middleware/auth.ts`
   - `authenticateToken()` funkcija:
     - Čita token iz `Authorization: Bearer <token>` header-a
     - Verifikuje token sa `jwt.verify()`
     - Dodaje `req.user = { userId, email, role }` na request
     - Ako token invalid/expired → 401

2. **Kreiraj role-based middleware:**
   - `requireRole(['teacher', 'student'])` funkcija
   - Proverava da li user ima dozvoljenu ulogu

#### Usage Example
```typescript
// Protected route
router.get('/profile', authenticateToken, getProfile);

// Role-based route
router.post('/lessons', authenticateToken, requireRole(['teacher']), createLesson);
```

#### Acceptance Criteria
- [ ] Čita token iz Authorization header-a
- [ ] Verifikuje JWT token
- [ ] Dodaje user info na request
- [ ] Vraća 401 za invalid/expired token
- [ ] Role-based middleware radi

#### Test Cases
```bash
# Test 1: Valid token
curl -X GET http://localhost:3001/api/users/profile \
  -H "Authorization: Bearer <valid-token>"

# Test 2: Missing token
curl -X GET http://localhost:3001/api/users/profile

# Test 3: Invalid token
curl -X GET http://localhost:3001/api/users/profile \
  -H "Authorization: Bearer invalid-token"
```

---

## FRONTEND TASKS

### Task FE-001: Login Page UI
**Dodeljeno:** Frontend Developer 1  
**Prioritet:** P1 (Critical)  
**Vreme:** 2 dana

#### Opis
Kreirati login stranicu sa formom, validacijom i integracijom sa auth API-jem.

#### Instrukcije
1. **Kreiraj login page:**
   - `src/app/(auth)/login/page.tsx`
   - Form sa: email input, password input, submit button
   - Koristi `react-hook-form` za form management
   - Koristi `zod` za validation schema

2. **Kreiraj API hook:**
   - `src/lib/api/auth.ts`
   - `login(email, password)` funkcija
   - Koristi `apiClient` iz `client.ts`
   - Čuva token u `localStorage`

3. **Kreiraj auth store (Zustand):**
   - `src/lib/store/authStore.ts`
   - State: `user`, `token`, `isAuthenticated`
   - Actions: `login()`, `logout()`, `setUser()`

4. **Dodaj error handling:**
   - Prikaži error poruke
   - Loading state tokom request-a

#### UI Requirements
- Email input sa validacijom
- Password input (type="password")
- "Zaboravili ste lozinku?" link (ne radi, samo UI)
- "Nemaš nalog? Registruj se" link
- Submit button sa loading state
- Error message display

#### Acceptance Criteria
- [ ] Form validacija (email format, required fields)
- [ ] API integracija sa `/api/auth/login`
- [ ] Token se čuva u localStorage
- [ ] User state se update-uje u store-u
- [ ] Redirect na dashboard nakon uspešnog login-a
- [ ] Error handling i prikaz poruka
- [ ] Loading state tokom request-a

#### Design Notes
- Koristi shadcn/ui komponente (Button, Input, Card)
- Responsive design
- Accessibility (ARIA labels)

---

### Task FE-002: Registration Page UI
**Dodeljeno:** Frontend Developer 1  
**Prioritet:** P1 (Critical)  
**Vreme:** 2 dana

#### Opis
Kreirati registration stranicu sa formom za sve 3 uloge (student, teacher, parent).

#### Instrukcije
1. **Kreiraj registration page:**
   - `src/app/(auth)/register/page.tsx`
   - Form sa: email, password, confirm password, firstName, lastName, role (radio buttons)
   - Validacija: password match, email format, min password length

2. **Kreiraj API hook:**
   - `src/lib/api/auth.ts`
   - `register(email, password, role, firstName, lastName)` funkcija

3. **Update auth store:**
   - Dodaj `register()` action

#### UI Requirements
- Email input
- Password input
- Confirm password input (sa match validacijom)
- First name input
- Last name input
- Role selection (radio buttons: Student, Teacher, Parent)
- Submit button
- Link ka login stranici

#### Acceptance Criteria
- [ ] Form validacija (sva polja)
- [ ] Password confirmation match
- [ ] Role selection radi
- [ ] API integracija sa `/api/auth/register`
- [ ] Auto-login nakon registracije
- [ ] Redirect na dashboard
- [ ] Error handling

---

### Task FE-003: Protected Routes & Layout
**Dodeljeno:** Frontend Developer 2  
**Prioritet:** P1 (Critical)  
**Vreme:** 1.5 dana

#### Opis
Implementirati protected routes i layout komponente za različite uloge.

#### Instrukcije
1. **Kreiraj auth guard:**
   - `src/components/auth/AuthGuard.tsx`
   - Proverava `isAuthenticated` iz store-a
   - Redirect na `/login` ako nije autentifikovan
   - Opciono: role-based guard

2. **Kreiraj layout komponente:**
   - `src/components/layouts/TeacherLayout.tsx`
   - `src/components/layouts/StudentLayout.tsx`
   - `src/components/layouts/ParentLayout.tsx`
   - Navigation bar sa logout buttonom

3. **Kreiraj dashboard pages:**
   - `src/app/(dashboard)/teacher/page.tsx`
   - `src/app/(dashboard)/student/page.tsx`
   - `src/app/(dashboard)/parent/page.tsx`
   - Osnovni placeholder sa "Welcome" porukom

4. **Update API client:**
   - Dodaj token u Authorization header automatski
   - Handle 401 errors (redirect na login)

#### Acceptance Criteria
- [ ] Protected routes zahtevaju autentifikaciju
- [ ] Redirect na login ako nema tokena
- [ ] Role-based routing radi
- [ ] Layout komponente za svaku ulogu
- [ ] Logout funkcionalnost
- [ ] Token se automatski dodaje u API requests

---

# 👤 SPRINT 3-4: USER PROFILES (Nedelja 3-4)

## BACKEND TASKS

### Task BE-004: Get User Profile Endpoint
**Dodeljeno:** Backend Developer 1  
**Prioritet:** P1 (Critical)  
**Vreme:** 1 dan

#### Opis
Implementirati GET `/api/users/profile` endpoint koji vraća profil trenutno ulogovanog korisnika.

#### Instrukcije
1. **Kreiraj user controller:**
   - `src/controllers/userController.ts`
   - `getProfile()` funkcija:
     - Koristi `authenticateToken` middleware
     - Dohvati user + profile + role-specific data
     - Vrati kompletan profil

2. **Kreiraj user routes:**
   - `src/routes/userRoutes.ts`
   - `GET /profile` sa auth middleware

#### Response (Success - 200)
```json
{
  "id": "uuid",
  "email": "student@test.com",
  "role": "student",
  "profile": {
    "firstName": "Marko",
    "lastName": "Marković"
  },
  "student": {
    "accessibilitySettings": {
      "font_family": "Arial",
      "font_size": 16,
      "line_spacing": 1.5,
      "text_color": "#000000",
      "background_color": "#FFFFFF"
    }
  }
}
```

#### Acceptance Criteria
- [ ] Zahteva autentifikaciju
- [ ] Vraća user + profile + role data
- [ ] Različiti response za različite uloge

---

### Task BE-005: Update User Profile Endpoint
**Dodeljeno:** Backend Developer 1  
**Prioritet:** P1 (Critical)  
**Vreme:** 1 dan

#### Opis
Implementirati PUT `/api/users/profile` endpoint za update profila.

#### Instrukcije
1. **Update user controller:**
   - `updateProfile()` funkcija
   - Validacija: firstName, lastName (opciono)
   - Update `profiles` tabelu

2. **Update routes:**
   - `PUT /profile` sa auth middleware

#### Request Body
```json
{
  "firstName": "Novo Ime",
  "lastName": "Novo Prezime"
}
```

#### Acceptance Criteria
- [ ] Validacija input-a
- [ ] Update profila u bazi
- [ ] Vraća updated profile

---

### Task BE-006: Student Accessibility Settings Endpoint
**Dodeljeno:** Backend Developer 2  
**Prioritet:** P1 (Critical)  
**Vreme:** 1.5 dana

#### Opis
Implementirati GET/PUT `/api/students/:id/settings` endpoint za accessibility settings.

#### Instrukcije
1. **Kreiraj student controller:**
   - `src/controllers/studentController.ts`
   - `getSettings()`, `updateSettings()` funkcije
   - Update `accessibility_settings` JSONB polje u `students` tabeli

2. **Kreiraj student routes:**
   - `src/routes/studentRoutes.ts`
   - `GET /:id/settings`, `PUT /:id/settings`

#### Request Body (PUT)
```json
{
  "font_family": "OpenDyslexic",
  "font_size": 18,
  "line_spacing": 2.0,
  "letter_spacing": 0.12,
  "text_color": "#000000",
  "background_color": "#FAFAC8"
}
```

#### Acceptance Criteria
- [ ] Validacija JSONB strukture
- [ ] Update settings u bazi
- [ ] Vraća updated settings

---

## FRONTEND TASKS

### Task FE-004: Profile Page UI
**Dodeljeno:** Frontend Developer 1  
**Prioritet:** P1 (Critical)  
**Vreme:** 2 dana

#### Opis
Kreirati profile stranicu gde korisnik može da vidi i edituje svoj profil.

#### Instrukcije
1. **Kreiraj profile page:**
   - `src/app/(dashboard)/profile/page.tsx`
   - Prikaži: email, firstName, lastName
   - Edit form za firstName i lastName

2. **Kreiraj API hooks:**
   - `src/lib/api/user.ts`
   - `getProfile()`, `updateProfile()` funkcije

3. **Kreiraj profile store (opciono):**
   - `src/lib/store/profileStore.ts`
   - Cache profile data

#### UI Requirements
- Display: email (read-only), firstName, lastName (editable)
- Edit button → form mode
- Save/Cancel buttons
- Success/error messages

#### Acceptance Criteria
- [ ] Prikazuje trenutni profil
- [ ] Edit funkcionalnost radi
- [ ] API integracija
- [ ] Loading states
- [ ] Error handling

---

### Task FE-005: Accessibility Settings Page (Student)
**Dodeljeno:** Frontend Developer 2  
**Prioritet:** P1 (Critical)  
**Vreme:** 2.5 dana

#### Opis
Kreirati accessibility settings stranicu za studente sa live preview-om.

#### Instrukcije
1. **Kreiraj settings page:**
   - `src/app/(dashboard)/student/settings/page.tsx`
   - Form sa svim accessibility opcijama:
     - Font family (dropdown)
     - Font size (slider)
     - Line spacing (slider)
     - Letter spacing (slider)
     - Text color (color picker)
     - Background color (color picker)

2. **Kreiraj preset buttons:**
   - "Dyslexia Friendly"
   - "Visual Impairment"
   - "Default"

3. **Kreiraj live preview:**
   - Prikaži sample text sa primenjenim settings-ima
   - Update-uj se u real-time

4. **Kreiraj API hooks:**
   - `src/lib/api/student.ts`
   - `getSettings()`, `updateSettings()`

#### UI Requirements
- Font family selector (Arial, OpenDyslexic, Comic Sans, etc.)
- Font size slider (12-24px)
- Line spacing slider (1.0-3.0)
- Letter spacing slider (0-0.2em)
- Text color picker
- Background color picker
- Preset buttons
- Live preview panel
- Save button

#### Acceptance Criteria
- [ ] Svi settings se mogu menjati
- [ ] Live preview radi u real-time
- [ ] Preset buttons primenjuju settings
- [ ] API integracija za save
- [ ] Settings se čuvaju u bazi
- [ ] Settings se primenjuju na lesson viewer (kasnije)

---

# 📚 SPRINT 5-6: LESSONS (Nedelja 5-6)

## BACKEND TASKS

### Task BE-007: Content Service Setup
**Dodeljeno:** Backend Developer 2  
**Prioritet:** P1 (Critical)  
**Vreme:** 1 dan

#### Opis
Kreirati Content Service (port 3002) za upload i upravljanje lekcijama.

#### Instrukcije
1. **Inicijalizuj projekat:**
   ```bash
   cd services/content
   npm init -y
   npm install express typescript ts-node @types/node @types/express
   npm install multer mammoth pdf-parse mongodb dotenv
   npm install cors helmet express-validator
   npm install -D nodemon @types/multer
   ```

2. **Kreiraj osnovnu strukturu:**
   - `src/index.ts` (Express app)
   - `src/config/database.ts` (MongoDB connection)
   - `src/config/multer.ts` (File upload config)
   - `src/routes/lessonRoutes.ts`
   - `src/controllers/lessonController.ts`
   - `src/services/fileService.ts` (Word/PDF parsing)

3. **Kreiraj .env:**
   ```env
   PORT=3002
   MONGODB_URL=mongodb://localhost:27017
   DATABASE_URL=postgresql://lumolearn:dev_pass@localhost:5432/lumolearn
   ```

#### Acceptance Criteria
- [ ] Service startuje na portu 3002
- [ ] MongoDB connection radi
- [ ] Health check endpoint radi

---

### Task BE-008: Lesson Upload Endpoint
**Dodeljeno:** Backend Developer 2  
**Prioritet:** P1 (Critical)  
**Vreme:** 2.5 dana

#### Opis
Implementirati POST `/api/lessons/upload` endpoint za upload Word/PDF fajlova.

#### Instrukcije
1. **Kreiraj file parsing service:**
   - `src/services/fileService.ts`
   - `parseWordFile(buffer)` - koristi `mammoth` za .docx
   - `parsePDFFile(buffer)` - koristi `pdf-parse` za .pdf
   - Vrati HTML content

2. **Kreiraj lesson controller:**
   - `uploadLesson()` funkcija:
     - Validira file (samo .docx, .pdf)
     - Parsira file → HTML
     - Sačuva HTML u MongoDB (`lessons` collection)
     - Kreira record u PostgreSQL `lessons` tabeli
     - Vrati lesson ID

3. **Multer config:**
   - Max file size: 10MB
   - File filter: samo .docx, .pdf

#### Request
```
POST /api/lessons/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>

file: <file>
title: "Naziv lekcije"
```

#### Response (Success - 201)
```json
{
  "success": true,
  "lesson": {
    "id": "uuid",
    "title": "Naziv lekcije",
    "contentId": "mongo-object-id",
    "teacherId": "uuid"
  }
}
```

#### Acceptance Criteria
- [ ] File upload radi (multer)
- [ ] Validacija file tipa (.docx, .pdf)
- [ ] Word parsing radi (mammoth)
- [ ] PDF parsing radi (pdf-parse)
- [ ] HTML se čuva u MongoDB
- [ ] Record se kreira u PostgreSQL
- [ ] Vraća lesson ID

---

### Task BE-009: Get Lessons Endpoints
**Dodeljeno:** Backend Developer 1  
**Prioritet:** P1 (Critical)  
**Vreme:** 1.5 dana

#### Opis
Implementirati GET `/api/lessons` i GET `/api/lessons/:id` endpoint-e.

#### Instrukcije
1. **GET /api/lessons:**
   - Vrati listu lekcija za trenutnog teacher-a
   - Filter: `is_published` (opciono)
   - Sort: `created_at DESC`

2. **GET /api/lessons/:id:**
   - Dohvati lesson iz PostgreSQL
   - Dohvati HTML content iz MongoDB
   - Vrati kompletan lesson sa content-om

#### Response (GET /api/lessons)
```json
{
  "lessons": [
    {
      "id": "uuid",
      "title": "Naziv lekcije",
      "isPublished": false,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Response (GET /api/lessons/:id)
```json
{
  "id": "uuid",
  "title": "Naziv lekcije",
  "content": "<html>...</html>",
  "isPublished": false,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### Acceptance Criteria
- [ ] Lista lekcija za teacher-a
- [ ] Single lesson sa content-om
- [ ] MongoDB + PostgreSQL integracija

---

### Task BE-010: Publish Lesson Endpoint
**Dodeljeno:** Backend Developer 1  
**Prioritet:** P2 (High)  
**Vreme:** 0.5 dana

#### Opis
Implementirati PUT `/api/lessons/:id/publish` endpoint.

#### Instrukcije
1. **Update lesson controller:**
   - `publishLesson()` funkcija
   - Set `is_published = true` u PostgreSQL

#### Acceptance Criteria
- [ ] Update `is_published` flag
- [ ] Samo teacher može publish-ovati svoje lekcije

---

## FRONTEND TASKS

### Task FE-006: Lesson Upload Page (Teacher)
**Dodeljeno:** Frontend Developer 1  
**Prioritet:** P1 (Critical)  
**Vreme:** 2 dana

#### Opis
Kreirati stranicu za upload lekcija (Word/PDF).

#### Instrukcije
1. **Kreiraj upload page:**
   - `src/app/(dashboard)/teacher/lessons/upload/page.tsx`
   - File input (accept .docx, .pdf)
   - Title input
   - Upload button
   - Progress indicator

2. **Kreiraj API hooks:**
   - `src/lib/api/lessons.ts`
   - `uploadLesson(file, title)` funkcija
   - Koristi `FormData` za multipart upload

3. **Dodaj drag & drop (opciono):**
   - Koristi `react-dropzone` ili custom implementacija

#### UI Requirements
- File input ili drag & drop zone
- Title input field
- Upload button
- Progress bar tokom upload-a
- Success message + redirect na lesson list
- Error handling

#### Acceptance Criteria
- [ ] File selection radi
- [ ] Validacija file tipa
- [ ] Upload progress indicator
- [ ] API integracija
- [ ] Success/error handling
- [ ] Redirect nakon uspeha

---

### Task FE-007: Lesson List Page (Teacher)
**Dodeljeno:** Frontend Developer 1  
**Prioritet:** P1 (Critical)  
**Vreme:** 1.5 dana

#### Opis
Kreirati stranicu sa listom lekcija za teacher-a.

#### Instrukcije
1. **Kreiraj lessons list page:**
   - `src/app/(dashboard)/teacher/lessons/page.tsx`
   - Prikaži listu lekcija (card layout)
   - Filter: Published/Unpublished
   - Actions: View, Edit, Publish, Delete

2. **Kreiraj lesson card component:**
   - `src/components/features/lessons/LessonCard.tsx`
   - Prikaži: title, status (published/unpublished), date

#### UI Requirements
- Grid layout sa lesson cards
- Published/Unpublished filter
- "New Lesson" button (link ka upload)
- Actions: View, Publish, Delete
- Empty state ako nema lekcija

#### Acceptance Criteria
- [ ] Lista lekcija se učitava
- [ ] Filter radi
- [ ] Actions funkcionišu
- [ ] Loading states
- [ ] Empty state

---

### Task FE-008: Lesson Viewer with Accessibility
**Dodeljeno:** Frontend Developer 2  
**Prioritet:** P1 (Critical)  
**Vreme:** 2.5 dana

#### Opis
Kreirati lesson viewer komponentu koja primenjuje accessibility settings.

#### Instrukcije
1. **Kreiraj lesson viewer:**
   - `src/components/features/lessons/LessonViewer.tsx`
   - Prikaži HTML content sa `dangerouslySetInnerHTML`
   - Primeni accessibility settings iz student store-a

2. **Kreiraj lesson page:**
   - `src/app/(dashboard)/student/lessons/[id]/page.tsx`
   - Fetch lesson content
   - Prikaži sa LessonViewer komponentom

3. **Integracija sa settings:**
   - Čitaj accessibility settings iz store-a
   - Primeni CSS stilove dinamički

#### UI Requirements
- HTML content display
- Primenjeni accessibility settings (font, colors, spacing)
- Responsive layout
- Print-friendly (opciono)

#### Acceptance Criteria
- [ ] HTML content se prikazuje
- [ ] Accessibility settings se primenjuju
- [ ] Real-time update kada se settings promene
- [ ] Responsive design
- [ ] Loading states

---

# 🤖 SPRINT 7-8: AI QUIZZES (Nedelja 7-8)

## BACKEND TASKS

### Task BE-011: AI Service Setup
**Dodeljeno:** Backend Developer 2  
**Prioritet:** P1 (Critical)  
**Vreme:** 1 dan

#### Opis
Kreirati AI Service (port 3003) za OpenAI integraciju.

#### Instrukcije
1. **Inicijalizuj projekat:**
   ```bash
   cd services/ai
   npm init -y
   npm install express typescript ts-node @types/node @types/express
   npm install openai dotenv cors helmet
   npm install -D nodemon
   ```

2. **Kreiraj osnovnu strukturu:**
   - `src/index.ts`
   - `src/routes/aiRoutes.ts`
   - `src/controllers/aiController.ts`
   - `src/services/openaiService.ts`

3. **Kreiraj .env:**
   ```env
   PORT=3003
   OPENAI_API_KEY=sk-...
   ```

#### Acceptance Criteria
- [ ] Service startuje na portu 3003
- [ ] OpenAI client se inicijalizuje
- [ ] Health check endpoint radi

---

### Task BE-012: Quiz Generation Endpoint
**Dodeljeno:** Backend Developer 2  
**Prioritet:** P1 (Critical)  
**Vreme:** 2.5 dana

#### Opis
Implementirati POST `/api/ai/generate-quiz` endpoint koji generiše kviz pomoću OpenAI.

#### Instrukcije
1. **Kreiraj OpenAI service:**
   - `src/services/openaiService.ts`
   - `generateQuiz(lessonContent, options)` funkcija
   - Koristi GPT-4 model
   - Prompt: generiši kviz sa N pitanja za decu 8-12 godina
   - Format: JSON sa pitanjima, opcijama, correctAnswer

2. **Kreiraj AI controller:**
   - `generateQuiz()` funkcija
   - Validacija: lessonContent, numQuestions (1-20), difficulty (easy/medium/hard)
   - Pozovi OpenAI service
   - Parse JSON response
   - Vrati questions array

#### Request Body
```json
{
  "lessonContent": "<html>...</html>",
  "numQuestions": 10,
  "difficulty": "medium"
}
```

#### Response (Success - 200)
```json
{
  "questions": [
    {
      "question": "Koja je glavna tema ove lekcije?",
      "options": ["A) Tema 1", "B) Tema 2", "C) Tema 3", "D) Tema 4"],
      "correctAnswer": "A"
    }
  ]
}
```

#### Acceptance Criteria
- [ ] OpenAI API integracija radi
- [ ] Generiše validan JSON
- [ ] Validacija input-a
- [ ] Error handling za API failures
- [ ] Token usage tracking (opciono)

---

### Task BE-013: Quiz CRUD Endpoints
**Dodeljeno:** Backend Developer 1  
**Prioritet:** P1 (Critical)  
**Vreme:** 2 dana

#### Opis
Implementirati CRUD endpoint-e za quiz-ove u Content Service-u.

#### Instrukcije
1. **POST /api/quizzes:**
   - Kreira novi quiz
   - Sačuva questions u MongoDB
   - Kreira record u PostgreSQL `quizzes` tabeli

2. **GET /api/quizzes/:id:**
   - Dohvati quiz sa questions iz MongoDB

3. **PUT /api/quizzes/:id:**
   - Update quiz (questions)
   - Teacher može editovati AI-generated quiz

4. **POST /api/quizzes/:id/publish:**
   - Set `status = 'published'`

#### Acceptance Criteria
- [ ] Create, Read, Update, Publish radi
- [ ] MongoDB + PostgreSQL integracija
- [ ] Samo teacher može editovati svoje quiz-ove

---

## FRONTEND TASKS

### Task FE-009: Quiz Generator UI (Teacher)
**Dodeljeno:** Frontend Developer 1  
**Prioritet:** P1 (Critical)  
**Vreme:** 2.5 dana

#### Opis
Kreirati UI za generisanje kvizova pomoću AI-a.

#### Instrukcije
1. **Kreiraj quiz generator page:**
   - `src/app/(dashboard)/teacher/lessons/[id]/quiz/generate/page.tsx`
   - Form: numQuestions (1-20), difficulty (easy/medium/hard)
   - "Generate Quiz" button
   - Loading state tokom generisanja

2. **Kreiraj API hooks:**
   - `src/lib/api/ai.ts`
   - `generateQuiz(lessonContent, options)` funkcija

3. **Kreiraj quiz preview:**
   - Prikaži generisana pitanja
   - "Save Quiz" button
   - "Regenerate" button

#### UI Requirements
- Form sa opcijama (numQuestions, difficulty)
- Generate button
- Loading spinner tokom generisanja
- Preview generisanih pitanja
- Save/Regenerate buttons

#### Acceptance Criteria
- [ ] Form validacija
- [ ] API integracija sa AI service-om
- [ ] Loading states
- [ ] Preview generisanih pitanja
- [ ] Save funkcionalnost

---

### Task FE-010: Quiz Editor UI (Teacher)
**Dodeljeno:** Frontend Developer 1  
**Prioritet:** P1 (Critical)  
**Vreme:** 2 dana

#### Opis
Kreirati editor za editovanje AI-generated quiz-ova.

#### Instrukcije
1. **Kreiraj quiz editor:**
   - `src/app/(dashboard)/teacher/quizzes/[id]/edit/page.tsx`
   - Editable lista pitanja
   - Za svako pitanje: question text, 4 opcije, correct answer
   - Add/Delete question buttons
   - Save button

2. **Kreiraj question editor component:**
   - `src/components/features/quizzes/QuestionEditor.tsx`
   - Form za jedno pitanje

#### UI Requirements
- Lista pitanja (editable)
- Za svako pitanje: question input, 4 option inputs, correct answer selector
- Add question button
- Delete question button
- Save button
- Publish button

#### Acceptance Criteria
- [ ] Edit pitanja radi
- [ ] Add/Delete pitanja radi
- [ ] Save funkcionalnost
- [ ] Publish funkcionalnost

---

# 📝 SPRINT 9-10: STUDENT FLOW (Nedelja 9-10)

## BACKEND TASKS

### Task BE-014: Quiz Submission Endpoint
**Dodeljeno:** Backend Developer 1  
**Prioritet:** P1 (Critical)  
**Vreme:** 2 dana

#### Opis
Implementirati POST `/api/quizzes/:id/submit` endpoint za submitovanje quiz odgovora.

#### Instrukcije
1. **Kreiraj quiz controller:**
   - `submitQuiz()` funkcija
   - Validacija: quiz postoji, student nije već submitovao (opciono)
   - Dohvati correct answers iz MongoDB
   - Izračunaj score (broj tačnih odgovora)
   - Sačuva `quiz_attempts` record u PostgreSQL
   - Vrati score + results

#### Request Body
```json
{
  "answers": {
    "question1": "A",
    "question2": "B",
    ...
  }
}
```

#### Response (Success - 200)
```json
{
  "score": 8,
  "totalQuestions": 10,
  "percentage": 80,
  "results": [
    {
      "question": "Pitanje 1?",
      "userAnswer": "A",
      "correctAnswer": "A",
      "isCorrect": true
    }
  ]
}
```

#### Acceptance Criteria
- [ ] Validacija odgovora
- [ ] Score calculation
- [ ] Čuva attempt u bazi
- [ ] Vraća detaljne rezultate

---

### Task BE-015: Get Published Lessons/Quizzes (Student)
**Dodeljeno:** Backend Developer 2  
**Prioritet:** P1 (Critical)  
**Vreme:** 1 dan

#### Opis
Implementirati endpoint-e za studente da vide published lekcije i quiz-ove.

#### Instrukcije
1. **GET /api/lessons/published:**
   - Vrati sve published lekcije (bez content-a, samo metadata)

2. **GET /api/quizzes/published:**
   - Vrati sve published quiz-ove (bez correct answers)

#### Acceptance Criteria
- [ ] Vraća samo published content
- [ ] Student ne vidi correct answers pre submit-a

---

## FRONTEND TASKS

### Task FE-011: Student Lessons List
**Dodeljeno:** Frontend Developer 2  
**Prioritet:** P1 (Critical)  
**Vreme:** 1.5 dana

#### Opis
Kreirati stranicu sa listom published lekcija za studente.

#### Instrukcije
1. **Kreiraj lessons list page:**
   - `src/app/(dashboard)/student/lessons/page.tsx`
   - Prikaži published lekcije
   - "Start Lesson" button

#### UI Requirements
- Grid layout sa lesson cards
- "Start Lesson" button
- Filter/search (opciono)

#### Acceptance Criteria
- [ ] Lista published lekcija
- [ ] Navigacija ka lesson viewer-u

---

### Task FE-012: Quiz Taker Component
**Dodeljeno:** Frontend Developer 2  
**Prioritet:** P1 (Critical)  
**Vreme:** 2.5 dana

#### Opis
Kreirati komponentu za radjenje quiz-a.

#### Instrukcije
1. **Kreiraj quiz taker:**
   - `src/app/(dashboard)/student/quizzes/[id]/take/page.tsx`
   - Prikaži pitanja (bez correct answers)
   - Radio buttons za odgovore
   - Submit button
   - Confirmation dialog pre submit-a

2. **Kreiraj quiz results page:**
   - `src/app/(dashboard)/student/quizzes/[id]/results/page.tsx`
   - Prikaži score, percentage
   - Prikaži results (tačni/netečni odgovori)

#### UI Requirements
- Lista pitanja sa radio buttons
- Progress indicator
- Submit button
- Results page: score, percentage, detailed results

#### Acceptance Criteria
- [ ] Quiz se učitava
- [ ] Odgovori se mogu selektovati
- [ ] Submit funkcionalnost
- [ ] Results page prikazuje rezultate
- [ ] Accessibility (keyboard navigation)

---

# 👨‍👩‍👧 SPRINT 11-12: PARENT DASHBOARD (Nedelja 11-12)

## BACKEND TASKS

### Task BE-016: Parent-Student Link Endpoint
**Dodeljeno:** Backend Developer 1  
**Prioritet:** P1 (Critical)  
**Vreme:** 1 dan

#### Opis
Implementirati endpoint za povezivanje parent-a sa student-om.

#### Instrukcije
1. **POST /api/parents/link-student:**
   - Kreira `parent_student` record
   - Validacija: parent i student postoje

2. **GET /api/parents/children:**
   - Vrati listu dece za parent-a

#### Acceptance Criteria
- [ ] Link creation radi
- [ ] Lista dece se vraća

---

### Task BE-017: Student Progress Endpoint
**Dodeljeno:** Backend Developer 2  
**Prioritet:** P1 (Critical)  
**Vreme:** 2 dana

#### Opis
Implementirati GET `/api/students/:id/progress` endpoint za progress tracking.

#### Instrukcije
1. **Kreiraj analytics controller:**
   - `getStudentProgress()` funkcija
   - Dohvati: quiz attempts, scores, lessons completed
   - Izračunaj: average score, total quizzes, completion rate

#### Response
```json
{
  "studentId": "uuid",
  "totalQuizzes": 15,
  "averageScore": 85,
  "lessonsCompleted": 10,
  "recentAttempts": [
    {
      "quizTitle": "Kviz 1",
      "score": 90,
      "date": "2024-01-01"
    }
  ]
}
```

#### Acceptance Criteria
- [ ] Progress data se vraća
- [ ] Samo parent može videti progress svoje dece

---

## FRONTEND TASKS

### Task FE-013: Parent Dashboard UI
**Dodeljeno:** Frontend Developer 1  
**Prioritet:** P1 (Critical)  
**Vreme:** 2.5 dana

#### Opis
Kreirati dashboard za parent-e sa pregledom dece i njihovog napretka.

#### Instrukcije
1. **Kreiraj parent dashboard:**
   - `src/app/(dashboard)/parent/page.tsx`
   - Prikaži listu dece
   - Za svako dete: progress overview

2. **Kreiraj child progress page:**
   - `src/app/(dashboard)/parent/children/[id]/progress/page.tsx`
   - Detaljan progress: quiz scores, lessons completed, charts

#### UI Requirements
- Lista dece (cards)
- Za svako dete: name, total quizzes, average score
- "View Progress" button
- Progress page: charts, recent attempts, statistics

#### Acceptance Criteria
- [ ] Lista dece se prikazuje
- [ ] Progress overview radi
- [ ] Detaljan progress page
- [ ] Charts/visualizations (opciono)

---

# 🧪 TESTING TASKS

## BACKEND TESTING

### Task BE-TEST-001: Auth Service Tests
**Dodeljeno:** Backend Developer 1  
**Prioritet:** P2 (High)  
**Vreme:** 2 dana

#### Opis
Napisati unit i integration testove za Auth Service.

#### Instrukcije
1. **Setup Jest:**
   ```bash
   npm install -D jest @types/jest ts-jest
   ```

2. **Testovi:**
   - Registration endpoint (success, duplicate email, invalid input)
   - Login endpoint (success, invalid credentials)
   - JWT middleware (valid token, invalid token, expired token)

#### Acceptance Criteria
- [ ] Test coverage > 60%
- [ ] Svi critical paths su testirani

---

## FRONTEND TESTING

### Task FE-TEST-001: Component Tests
**Dodeljeno:** Frontend Developer 2  
**Prioritet:** P2 (High)  
**Vreme:** 2 dana

#### Opis
Napisati testove za kritične komponente.

#### Instrukcije
1. **Setup React Testing Library:**
   ```bash
   npm install -D @testing-library/react @testing-library/jest-dom
   ```

2. **Testovi:**
   - Login form
   - Registration form
   - Lesson viewer
   - Quiz taker

#### Acceptance Criteria
- [ ] Test coverage > 60%
- [ ] Critical user flows su testirani

---

# 📊 PRIORITY MATRIX

## P1 (Critical - Must Have)
- BE-001, BE-002, BE-003 (Authentication)
- BE-004, BE-005, BE-006 (Profiles)
- BE-007, BE-008, BE-009 (Lessons)
- BE-011, BE-012, BE-013 (AI Quizzes)
- BE-014, BE-015 (Student Flow)
- BE-016, BE-017 (Parent Dashboard)
- FE-001, FE-002, FE-003 (Auth UI)
- FE-004, FE-005 (Profile UI)
- FE-006, FE-007, FE-008 (Lessons UI)
- FE-009, FE-010 (Quiz UI)
- FE-011, FE-012 (Student UI)
- FE-013 (Parent UI)

## P2 (High - Should Have)
- BE-010 (Publish Lesson)
- BE-TEST-001, FE-TEST-001 (Testing)

---

# 📅 TIMELINE SUMMARY

| Nedelja | Backend Tasks | Frontend Tasks | Status |
|---------|---------------|----------------|--------|
| 1-2 | BE-001, BE-002, BE-003 | FE-001, FE-002, FE-003 | 🔴 Not Started |
| 3-4 | BE-004, BE-005, BE-006 | FE-004, FE-005 | 🔴 Not Started |
| 5-6 | BE-007, BE-008, BE-009, BE-010 | FE-006, FE-007, FE-008 | 🔴 Not Started |
| 7-8 | BE-011, BE-012, BE-013 | FE-009, FE-010 | 🔴 Not Started |
| 9-10 | BE-014, BE-015 | FE-011, FE-012 | 🔴 Not Started |
| 11-12 | BE-016, BE-017 | FE-013 | 🔴 Not Started |

---

# ✅ ACCEPTANCE CRITERIA - MVP COMPLETE

MVP je gotov kada:
- [ ] Sve 3 uloge mogu da se registruju i loguju
- [ ] Teacher može upload-ovati Word/PDF lekcije
- [ ] Lekcija se prikazuje sa accessibility settings
- [ ] AI generiše kvizove (OpenAI)
- [ ] Teacher može editovati AI-generated quiz
- [ ] Student može raditi quiz
- [ ] Auto-grading radi
- [ ] Parent vidi progress deteta
- [ ] Nema kritičnih bugova
- [ ] Page load < 3s
- [ ] Test coverage > 60%

---

**Dokument kreiran:** 2024  
**Poslednji update:** 2024  
**Status:** Ready for Implementation 🚀

