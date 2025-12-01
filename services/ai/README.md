# 🤖 LumoLearn AI Service (Google Gemini)

AI Service za generisanje kvizova pomoću Google Gemini API-ja.

## 🚀 Setup

### 1. Instaliraj dependencies

```bash
cd services/ai
npm install
```

### 2. Konfiguriši environment variables

Kopiraj `.env.example` u `.env`:

```bash
cp .env.example .env
```

Dodaj svoj **Google Gemini API key** u `.env`:

```env
GEMINI_API_KEY=your-api-key-here
```

### 3. Dobij besplatan Gemini API Key

1. Idi na: https://aistudio.google.com/app/apikey
2. Klikni "Get API Key" ili "Create API Key"
3. Kopiraj ključ (format: `AIzaSy...`)
4. Zalepi u `.env` fajl

**Napomena:** Gemini API je **potpuno besplatan** sa limitom od 1500 zahteva dnevno.

## 🏃 Pokretanje

### Development mode (sa nodemon)

```bash
npm run dev
```

### Production mode

```bash
npm run build
npm start
```

Servis će biti dostupan na: **http://localhost:3003**

## 📡 API Endpoints

### 1. Health Check

**GET** `/health`

```bash
curl http://localhost:3003/health
```

Response:
```json
{
  "success": true,
  "message": "AI Service is running",
  "service": "lumolearn-ai-service",
  "version": "1.0.0"
}
```

### 2. Test Gemini Connection

**GET** `/api/ai/test`

```bash
curl http://localhost:3003/api/ai/test
```

### 3. Generate Quiz (Glavni endpoint)

**POST** `/api/ai/generate-quiz`

**Request Body:**
```json
{
  "lessonContent": "<html>Sadržaj lekcije ovde...</html>",
  "numQuestions": 10,
  "difficulty": "medium"
}
```

**Parameters:**
- `lessonContent` (string, required): HTML ili plain text sadržaj lekcije (min 50 karaktera)
- `numQuestions` (number, optional): Broj pitanja (1-20, default: 10)
- `difficulty` (string, optional): Težina - "easy", "medium", "hard" (default: "medium")

**Response:**
```json
{
  "success": true,
  "questions": [
    {
      "question": "Koja je glavna tema ove lekcije?",
      "options": [
        "A) Tema 1",
        "B) Tema 2",
        "C) Tema 3",
        "D) Tema 4"
      ],
      "correctAnswer": "A"
    }
  ],
  "metadata": {
    "generated": 10,
    "requested": 10,
    "difficulty": "medium"
  }
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:3003/api/ai/generate-quiz \
  -H "Content-Type: application/json" \
  -d '{
    "lessonContent": "Matematika je nauka o brojevima, oblicima i uzorcima. Sabiranje je matematička operacija...",
    "numQuestions": 5,
    "difficulty": "easy"
  }'
```

## 🛠️ Tehnologije

- **Express.js 5** - Web framework
- **TypeScript 5** - Type safety
- **Google Gemini AI (gemini-1.5-flash)** - AI model za generisanje kvizova
- **express-validator** - Input validacija
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing

## 📊 Gemini API Limiti (Besplatni Tier)

| Model | Requests/Min | Requests/Day |
|-------|-------------|--------------|
| gemini-1.5-flash | 60 | 1500 |
| gemini-1.5-pro | 15 | 1500 |

**Napomena:** Za hackathon demo, 1500 zahteva dnevno je više nego dovoljno!

## 🔒 Sigurnost

- API key se čuva u `.env` fajlu (ne commit-uje se u git)
- CORS omogućen samo za dozvoljene origin-e
- Helmet middleware za sigurnosne header-e
- Input validacija sa express-validator

## 🧪 Testiranje

```bash
# Test health endpoint
curl http://localhost:3003/health

# Test Gemini connection
curl http://localhost:3003/api/ai/test

# Test quiz generation
curl -X POST http://localhost:3003/api/ai/generate-quiz \
  -H "Content-Type: application/json" \
  -d '{"lessonContent":"Test lekcija sa dovoljno sadržaja za generisanje kviza...","numQuestions":3,"difficulty":"easy"}'
```

## 📝 Napomene

- Servis koristi **Gemini 1.5 Flash** model (brz i besplatan)
- Prompt je optimizovan za decu sa posebnim potrebama (jasna pitanja, jednostavan jezik)
- Automatski strip-uje HTML tagove iz lekcije pre slanja AI-ju
- Validira i filtrira sve generisane odgovore pre vraćanja

## 🐛 Troubleshooting

### Error: "GEMINI_API_KEY is not configured"

**Rešenje:** Proveri da si dodao API key u `.env` fajl.

### Error: "Failed to connect to Gemini API"

**Rešenje:** Proveri internet konekciju i validnost API key-a.

### Pitanja nisu generisana

**Rešenje:** Proveri da `lessonContent` ima najmanje 50 karaktera i smisleni sadržaj.

## 📞 Support

Za pomoć, pogledaj dokumentaciju: https://ai.google.dev/gemini-api/docs
