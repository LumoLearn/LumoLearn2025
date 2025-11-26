# MongoDB Access Guide - LumoLearn

## 🗄️ MongoDB GUI Tool: Mongo Express

**Status:** ✅ Running
**Access URL:** http://localhost:8081
**Authentication:** None (disabled for development)

---

## 📊 Quick Access

### Web Interface (Mongo Express)
```
URL: http://localhost:8081
```

**Features:**
- ✅ Browse databases and collections
- ✅ View, edit, and delete documents
- ✅ Execute MongoDB queries
- ✅ Import/Export data (JSON, CSV)
- ✅ Create/delete databases and collections
- ✅ View indexes and statistics

---

## 🔍 Available Databases

### `lumolearn_content` (Content Service)
**Purpose:** Stores lesson and quiz content (HTML)

**Collections:**
- `lessons` - Lesson HTML content
- `quizzes` - Quiz questions and content

**Access:**
1. Open http://localhost:8081
2. Click on `lumolearn_content` database
3. Select collection to view documents

---

## 🚀 Common Operations

### View All Databases
```
http://localhost:8081
```

### Browse Lesson Content
```
1. Open http://localhost:8081
2. Click "lumolearn_content"
3. Click "lessons" collection
4. View/Edit documents
```

### Execute Query
```javascript
// In Mongo Express query box:
{ "teacherId": "some-uuid" }

// Find lessons by title:
{ "title": { "$regex": "Math", "$options": "i" } }
```

### View Document Structure
Click on any document to see full JSON structure with:
- HTML content
- Metadata
- Timestamps

---

## 🔧 Docker Configuration

**Service Name:** `mongo-express`
**Container Name:** `lumolearn-mongo-express`
**Image:** `mongo-express:latest`
**Port:** `8081`

**Connection:**
- **MongoDB URL:** `mongodb://mongodb:27017`
- **Basic Auth:** Disabled (development mode)

---

## 📝 Mongo Express vs pgAdmin

| Feature | pgAdmin (PostgreSQL) | Mongo Express (MongoDB) |
|---------|----------------------|-------------------------|
| Access | http://localhost:5050 | http://localhost:8081 |
| Login Required | ✅ Yes (admin@lumolearn.com / admin) | ❌ No |
| Data Type | Relational (Tables) | Document (Collections) |
| View Data | Table rows | JSON documents |
| Query Language | SQL | MongoDB queries |

---

## 🛠️ Troubleshooting

### Mongo Express Not Loading

**Check Container Status:**
```bash
docker ps | grep mongo-express
```

**View Logs:**
```bash
docker logs lumolearn-mongo-express
```

**Restart Container:**
```bash
docker-compose restart mongo-express
```

### Can't See lumolearn_content Database

**Reason:** Database is created when first document is inserted (BE-008)

**Solution:** Database will appear after:
- Content Service inserts first lesson (BE-008)
- Or manually create it via Mongo Express

### Connection Issues

**Check MongoDB is Running:**
```bash
docker ps | grep mongodb
```

**Test MongoDB Connection:**
```bash
docker exec -it lumolearn-mongodb mongosh --eval "db.version()"
```

---

## 📚 Alternative Tools

### MongoDB Compass (Desktop App)
**Download:** https://www.mongodb.com/try/download/compass

**Connection String:**
```
mongodb://localhost:27017
```

**When to Use:**
- More advanced features needed
- Visual query builder
- Schema analysis
- Performance monitoring

### MongoDB Shell (mongosh)
**Access via Docker:**
```bash
docker exec -it lumolearn-mongodb mongosh
```

**Basic Commands:**
```javascript
// List databases
show dbs

// Use database
use lumolearn_content

// List collections
show collections

// Find documents
db.lessons.find().pretty()

// Count documents
db.lessons.countDocuments()
```

---

## 🔐 Security Note

**⚠️ Development Mode:** Basic authentication is disabled for easier development.

**Production:** Enable authentication by updating `docker-compose.yml`:
```yaml
mongo-express:
  environment:
    ME_CONFIG_BASICAUTH: true
    ME_CONFIG_BASICAUTH_USERNAME: admin
    ME_CONFIG_BASICAUTH_PASSWORD: secure_password
```

---

## 📖 Useful Resources

- **Mongo Express Docs:** https://github.com/mongo-express/mongo-express
- **MongoDB Docs:** https://docs.mongodb.com/
- **Query Syntax:** https://docs.mongodb.com/manual/tutorial/query-documents/

---

## ✅ Setup Checklist

- [x] Docker Compose updated with mongo-express service
- [x] Mongo Express container running
- [x] Web interface accessible at http://localhost:8081
- [x] MongoDB connection working
- [x] Ready for BE-008 lesson uploads

---

**Last Updated:** 2025-11-26
**Maintained By:** LumoLearn Development Team
