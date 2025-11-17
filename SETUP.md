# LumoLearn - Setup Instrukcije za Nove Developere

## 📋 Preduslovi

Pre početka, instalirajte sledeće:

```bash
# Node.js 18+ i npm
node --version   # v18.0.0+
npm --version    # 9.0.0+

# Docker Desktop
docker --version # 24.0.0+

# Git
git --version    # 2.30.0+
```

---

## 🚀 Setup Koraci (30-45 minuta)

### 1. Clone Repository

```bash
git clone <repository-url>
cd LumoLearn2025
```

### 2. Pokreni Docker (Baze podataka)

```bash
# Pokreni PostgreSQL i MongoDB
docker compose up -d

# Proveri da li su kontejneri pokrenuti
docker compose ps
```

### 3. Primeni Database Schema

```bash
# Windows PowerShell
Get-Content database/migrations/001_mvp_schema.sql | docker exec -i lumolearn-postgres psql -U lumolearn -d lumolearn

# Linux/Mac
docker exec -i lumolearn-postgres psql -U lumolearn -d lumolearn < database/migrations/001_mvp_schema.sql
```

### 4. Setup Frontend

```bash
cd frontend

# Instaliraj dependencies
npm install

# Kreiraj .env.local fajl
# Kopiraj sledeći sadržaj:
```

**Kreiraj `frontend/.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

```bash
# Pokreni frontend (test)
npm run dev
# Otvori: http://localhost:3000
# Zaustavi sa Ctrl+C
```

### 5. Setup Auth Service (Backend)

```bash
cd ../services/auth

# Instaliraj dependencies
npm install

# Kreiraj .env fajl
# Kopiraj sledeći sadržaj:
```

**Kreiraj `services/auth/.env`:**
```env
PORT=3001
DATABASE_URL=postgresql://lumolearn:dev_pass@localhost:5432/lumolearn
JWT_SECRET=change-this-in-production
JWT_EXPIRES_IN=15m
```

```bash
# Pokreni auth service (test)
npm run dev
# Test: http://localhost:3001/health
# Zaustavi sa Ctrl+C
```

### 6. (Opciono) Setup pgAdmin

pgAdmin je već u `docker-compose.yml`. Ako želiš grafički interfejs za bazu:

```bash
# pgAdmin je već pokrenut sa docker compose up -d
# Otvori: http://localhost:5050
# Email: admin@lumolearn.com
# Password: admin
```

**Dodaj server u pgAdmin:**
- Host: `lumolearn-postgres`
- Port: `5432`
- Database: `lumolearn`
- Username: `lumolearn`
- Password: `dev_pass`

---

## ✅ Provera da li sve radi

### 1. Docker
```bash
docker compose ps
# Treba da vidiš: postgres, mongodb, pgadmin (svi Up)
```

### 2. Database
```bash
docker exec -i lumolearn-postgres psql -U lumolearn -d lumolearn -c "SELECT COUNT(*) FROM users;"
# Treba da vidiš: 1 (test korisnik)
```

### 3. Auth Service
```bash
curl http://localhost:3001/health
# Treba da vidiš: {"status":"OK","service":"auth-service"}

curl http://localhost:3001/health/db
# Treba da vidiš: {"status":"OK","database":"connected",...}
```

### 4. Frontend
```bash
# Otvori: http://localhost:3000
# Treba da vidiš Next.js homepage
```

---

## 🎯 Daily Workflow

### Pokretanje projekta:

**Terminal 1 - Docker:**
```bash
docker compose up -d
```

**Terminal 2 - Auth Service:**
```bash
cd services/auth
npm run dev
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

### Gašenje projekta:

1. `Ctrl + C` u svakom terminalu (frontend, backend)
2. `docker compose down` (zaustavi Docker)

---

## 🐛 Troubleshooting

### Problem: Port već u upotrebi
```bash
# Pronađi proces
netstat -ano | findstr :3001

# Zaustavi proces
taskkill /PID <PID> /F
```

### Problem: Docker kontejneri ne startuju
```bash
# Proveri logove
docker compose logs

# Restartuj
docker compose restart
```

### Problem: Database connection error
```bash
# Proveri da li je Docker pokrenut
docker compose ps

# Proveri connection string u .env fajlu
# Treba: postgresql://lumolearn:dev_pass@localhost:5432/lumolearn
```

### Problem: npm install ne radi
```bash
# Obriši node_modules i package-lock.json
rm -rf node_modules package-lock.json

# Instaliraj ponovo
npm install
```

---

## 📝 Važne Napomene

1. **NE pushuj `.env` fajlove** - oni su u `.gitignore`
2. **Kreiraj `.env` fajlove lokalno** - koristi template iz ovog fajla
3. **Database password:** `dev_pass` (development only!)
4. **Test korisnik:** `teacher@test.com` / `Test1234!`

---

## 🔗 Korisni Linkovi

- Frontend: http://localhost:3000
- Auth Service: http://localhost:3001
- pgAdmin: http://localhost:5050
- Health Check: http://localhost:3001/health
- Database Test: http://localhost:3001/health/db

---

**Ako imaš problema, kontaktiraj tim lead-a!** 🚀

