# Environment Configuration Guide

## 📋 Pregled `.env` Fajlova

### Auth Service (`services/auth/.env`)

```env
# Auth Service Configuration
PORT=3001
NODE_ENV=development

# PostgreSQL Configuration
DATABASE_URL=postgresql://lumolearn:dev_pass@localhost:5432/lumolearn

# JWT Configuration
JWT_SECRET=change-this-in-production
JWT_EXPIRES_IN=15m

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### Content Service (`services/content/.env`)

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

# JWT Configuration
JWT_SECRET=change-this-in-production
JWT_EXPIRES_IN=15m

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

---

## 🔑 Ključne Konfiguracije

### 1. **PORT** (Različito za svaki servis)
- Auth: `3001`
- Content: `3002`
- **Važno:** Svaki mikroservis MORA imati jedinstveni port!

### 2. **NODE_ENV** (Isto za oba)
- Development: `development`
- Production: `production`
- **Upotreba:** Conditional logging, debug mode, error details

### 3. **DATABASE_URL** (Isto za oba) ✅
- **Razlog:** Oba servisa koriste **istu PostgreSQL bazu**
- Database: `lumolearn`
- User: `lumolearn`
- Password: `dev_pass`

### 4. **JWT_SECRET** (Isto za oba) ✅ KRITIČNO!
- **Mora biti identično u svim servisima!**
- **Razlog:** Auth generiše token, Content ga verifikuje
- **Ako se ne poklapaju:** "Invalid token" greška

### 5. **JWT_EXPIRES_IN** (Isto za oba) ✅
- Default: `15m` (15 minuta)
- **Preporuka:** Isto za sve servise

### 6. **CORS_ORIGIN** (Različito)

**Auth Service:**
```env
CORS_ORIGIN=http://localhost:3000
```
- Samo frontend (Next.js na portu 3000)

**Content Service:**
```env
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```
- Frontend (3000) + Auth Service (3001)
- **Razlog:** Content može primati requests od oba servisa

---

## 🗄️ MongoDB Baza - FAQ

### Pitanje: Zašto nemam `lumolearn_content` bazu u Mongo Express?

**Odgovor:** MongoDB automatski kreira bazu **tek kada se ubaci prvi dokument**.

**Trenutno stanje:**
```bash
docker exec lumolearn-mongodb mongosh --eval "show dbs"
# Output: admin, config, local
# lumolearn_content još ne postoji ✅ Normalno!
```

**Nakon prvog upload-a lekcije (BE-008):**
```bash
docker exec lumolearn-mongodb mongosh --eval "show dbs"
# Output: admin, config, local, lumolearn_content ✅
```

**Provera nakon upload-a:**
```bash
# Vidi sve baze
docker exec lumolearn-mongodb mongosh --eval "show dbs"

# Vidi kolekcije u lumolearn_content
docker exec lumolearn-mongodb mongosh lumolearn_content --eval "show collections"
# Output: lessons

# Broji dokumente
docker exec lumolearn-mongodb mongosh lumolearn_content --eval "db.lessons.countDocuments()"
# Output: 1 (ili koliko god lekcija uploaduješ)
```

### Kada će baza biti kreirana?

✅ **Prvi PUT na:** `POST /api/lessons/upload`
✅ **Sa validnim:** `.docx` ili `.pdf` fajlom
✅ **Automatski kreira:**
- Database: `lumolearn_content`
- Collection: `lessons`
- Document: `{ html, plainText, metadata, createdAt, updatedAt }`

---

## 🔧 Content Service Specifične Konfiguracije

### MONGODB_URL
```env
MONGODB_URL=mongodb://localhost:27017
```
- Connection string za MongoDB
- **Default port:** 27017

### MONGODB_DB_NAME
```env
MONGODB_DB_NAME=lumolearn_content
```
- Ime baze koja će se koristiti
- Kreira se automatski pri prvom insert-u

### MAX_FILE_SIZE_MB
```env
MAX_FILE_SIZE_MB=10
```
- Maksimalna veličina uploadovanog fajla (u MB)
- **Default:** 10MB
- **Može se promeniti** bez editovanja koda

### ALLOWED_FILE_TYPES
```env
ALLOWED_FILE_TYPES=.docx,.pdf
```
- Dozvoljeni tipovi fajlova (comma-separated)
- **Default:** `.docx,.pdf`
- **Može se proširiti:** `.docx,.pdf,.txt` (ako dodaš parser)

### UPLOAD_DIR
```env
UPLOAD_DIR=uploads
```
- Direktorijum za privremene upload-ove
- **Trenutno:** Memory storage (ne čuvaju se na disk)
- **Za buduće:** Ako prebaciš na disk storage

---

## ⚠️ Važne Napomene

### 1. JWT_SECRET Sinhronizacija
**KRITIČNO:** Svi mikroservisi moraju imati **identičan JWT_SECRET**!

```env
# ✅ DOBRO - Isto u oba servisa
JWT_SECRET=change-this-in-production

# ❌ LOŠE - Različiti secreti
Auth:    JWT_SECRET=secret-1
Content: JWT_SECRET=secret-2
# Rezultat: "Invalid token" greška!
```

### 2. DATABASE_URL Deljenje
**Auth i Content servisi dele istu PostgreSQL bazu:**
- Auth: Kreira users, profiles, roles
- Content: Kreira lessons, quizzes

**Benefit:** Relacije između tabela (foreign keys)

### 3. MongoDB je Samo za Content
**Samo Content Service koristi MongoDB:**
- MongoDB: HTML content, quiz questions (veliki podaci)
- PostgreSQL: Metadata, relationships (strukturirani podaci)

---

## 🚀 Setup za Nove Developere

### 1. Clone projekta
```bash
git clone <repo>
cd LumoLearn2025
```

### 2. Pokreni Docker
```bash
docker-compose up -d
```

### 3. Kreiraj `.env` fajlove

**Auth Service:**
```bash
cp services/auth/.env.example services/auth/.env
# Ili kopiraj sadržaj iz ovog dokumenta
```

**Content Service:**
```bash
cp services/content/.env.example services/content/.env
# Ili kopiraj sadržaj iz ovog dokumenta
```

### 4. Instaliraj dependencies
```bash
# Auth Service
cd services/auth
npm install

# Content Service
cd services/content
npm install
```

### 5. Pokreni servise
```bash
# Auth Service (terminal 1)
cd services/auth
npm run dev

# Content Service (terminal 2)
cd services/content
npm run dev
```

### 6. Proveri
```bash
# Health checks
curl http://localhost:3001/health  # Auth
curl http://localhost:3002/health  # Content
curl http://localhost:3002/health/db  # Databases
```

---

## 🔍 Troubleshooting

### "Invalid token" Greška
**Uzrok:** JWT_SECRET nije isti u oba servisa
**Rešenje:** Kopiraj JWT_SECRET iz Auth u Content (ili obrnuto)

### MongoDB baza ne postoji
**Uzrok:** Normalno - čeka prvi insert
**Rešenje:** Uploaduj lekciju kroz BE-008 endpoint

### CORS greška u browseru
**Uzrok:** CORS_ORIGIN ne uključuje frontend URL
**Rešenje:** Dodaj `http://localhost:3000` u CORS_ORIGIN

### Port already in use
**Uzrok:** Servis već radi
**Rešenje:**
```bash
# Windows
taskkill /F /IM node.exe

# Linux/Mac
lsof -ti:3001 | xargs kill
```

---

## 📊 Poređenje Konfiguracija

| Varijabla | Auth | Content | Mora biti Isto? |
|-----------|------|---------|-----------------|
| PORT | 3001 | 3002 | ❌ Ne (različito) |
| NODE_ENV | development | development | ✅ Da (best practice) |
| DATABASE_URL | ✅ | ✅ | ✅ DA (dele PostgreSQL) |
| JWT_SECRET | ✅ | ✅ | ✅ DA (KRITIČNO!) |
| JWT_EXPIRES_IN | 15m | 15m | ✅ Da (preporuka) |
| CORS_ORIGIN | localhost:3000 | localhost:3000,3001 | ⚠️ Slično (ali može različito) |
| MONGODB_URL | - | ✅ | ❌ Samo Content |
| MONGODB_DB_NAME | - | ✅ | ❌ Samo Content |

---

## 🎯 Checklist za Production

- [ ] Promeni `JWT_SECRET` na siguran random string (min 32 karaktera)
- [ ] Promeni PostgreSQL password
- [ ] Promeni MongoDB connection (ako remote)
- [ ] Postavi `NODE_ENV=production`
- [ ] Ažuriraj `CORS_ORIGIN` na production URL-ove
- [ ] Increase `MAX_FILE_SIZE_MB` ako treba
- [ ] Enable MongoDB authentication
- [ ] Setup HTTPS za sve servise
- [ ] Add rate limiting
- [ ] Setup monitoring (Sentry, LogRocket, etc.)

---

**Last Updated:** 2025-11-27
**Maintained by:** LumoLearn Development Team
