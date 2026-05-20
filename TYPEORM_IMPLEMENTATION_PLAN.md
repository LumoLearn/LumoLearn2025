# TypeORM Implementation Plan - LumoLearn2025

## Pregled

Ovaj dokument opisuje kompletan proces implementacije TypeORM-a u LumoLearn projekat. TypeORM će omogućiti automatsko generisanje migracija iz TypeScript entiteta, slično kao Doctrine u Symfony-u.

---

## Trenutno Stanje

- **Database Driver**: Raw PostgreSQL `pg` library
- **Migracije**: Ručno pisane SQL fajlove (`database/migrations/001_mvp_schema.sql`)
- **Modeli**: TypeScript interfejsi sa custom database funkcijama
- **Upiti**: Raw SQL sa `pool.query()`

## Ciljno Stanje

- **ORM**: TypeORM sa Entity dekoratorima
- **Migracije**: Automatski generisane iz entiteta
- **Modeli**: TypeORM Entities sa relacionim vezama
- **Upiti**: Repository pattern + Query Builder
- **CLI**: TypeORM komande za migracije

---

## Faza 1: Instalacija i Osnovna Konfiguracija

### 1.1 Instalacija Paketa

```bash
cd services/auth
npm install typeorm reflect-metadata
npm install -D @types/node ts-node
```

**Objašnjenje paketa:**
- `typeorm` - ORM framework
- `reflect-metadata` - Potreban za dekoratore (mora biti importovan pre svega)
- `ts-node` - Za izvršavanje TypeScript komandi direktno

### 1.2 Update package.json Scripts

Dodati sledeće skripte u `services/auth/package.json`:

```json
{
  "scripts": {
    "typeorm": "typeorm-ts-node-commonjs",
    "migration:generate": "npm run typeorm -- migration:generate",
    "migration:create": "npm run typeorm -- migration:create",
    "migration:run": "npm run typeorm -- migration:run",
    "migration:revert": "npm run typeorm -- migration:revert",
    "migration:show": "npm run typeorm -- migration:show",
    "schema:sync": "npm run typeorm -- schema:sync",
    "schema:drop": "npm run typeorm -- schema:drop"
  }
}
```

### 1.3 Update tsconfig.json

Dodati podršku za dekoratore u `services/auth/tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "strictPropertyInitialization": false
  }
}
```

**Napomena**: `strictPropertyInitialization: false` je potreban jer TypeORM sam inicijalizuje properije.

### 1.4 Kreiranje TypeORM Konfiguracije

Kreirati novi fajl: `services/auth/src/config/typeorm.config.ts`

```typescript
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: false, // VAŽNO: uvek false u production!
  logging: process.env.NODE_ENV === 'development',
  entities: [path.join(__dirname, '../entities/**/*.{ts,js}')],
  migrations: [path.join(__dirname, '../../migrations/**/*.{ts,js}')],
  subscribers: [],

  // Connection pool settings
  extra: {
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  }
});
```

**Važne napomene:**
- `synchronize: false` - Ne dopuštaj automatsku izmenu baze, koristimo migracije!
- `logging: true` u development režimu za debugging
- `entities` - Path do TypeORM entiteta
- `migrations` - Path do migration fajlova

### 1.5 Update Glavnog Index Fajla

Update `services/auth/src/index.ts` da inicijalizuje TypeORM:

```typescript
import 'reflect-metadata'; // MORA biti prva linija!
import express from 'express';
import { AppDataSource } from './config/typeorm.config';

const app = express();

// Inicijalizuj TypeORM pre pokretanja servera
AppDataSource.initialize()
  .then(() => {
    console.log('✓ Database connection established');

    // Postojeći middleware i routes setup...

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`✓ Auth service running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('✗ Database connection failed:', error);
    process.exit(1);
  });
```

---

## Faza 2: Kreiranje TypeORM Entiteta

### 2.1 Struktura Direktorijuma

Kreirati novu strukturu:

```
services/auth/src/
├── entities/           # TypeORM entiteti
│   ├── User.entity.ts
│   ├── Profile.entity.ts
│   ├── Student.entity.ts
│   ├── Teacher.entity.ts
│   ├── Parent.entity.ts
│   ├── Lesson.entity.ts
│   ├── Quiz.entity.ts
│   └── QuizAttempt.entity.ts
├── models/            # Stari modeli (zadržati za reference)
└── repositories/      # Custom repositories (opciono)
```

### 2.2 Primer: User Entity

Kreirati `services/auth/src/entities/User.entity.ts`:

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  Index,
  BeforeInsert
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Profile } from './Profile.entity';

export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  PARENT = 'parent',
  ADMIN = 'admin'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 255 })
  @Index()
  email: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STUDENT
  })
  role: UserRole;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relaciona veza
  @OneToOne(() => Profile, profile => profile.user)
  profile: Profile;

  // Helper metode
  @BeforeInsert()
  async hashPassword() {
    if (this.passwordHash && !this.passwordHash.startsWith('$2b$')) {
      this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
    }
  }

  async verifyPassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.passwordHash);
  }
}
```

**Ključni TypeORM Dekoratori:**
- `@Entity('users')` - Mapira klasu na tabelu
- `@PrimaryGeneratedColumn('uuid')` - Auto-generisan UUID primary key
- `@Column()` - Mapira property na kolonu
- `@CreateDateColumn()` - Automatski timestamp
- `@Index()` - Kreira indeks na kolonu
- `@OneToOne()` - Relacija jedan-na-jedan
- `@BeforeInsert()` - Hook pre inserta

### 2.3 Primer: Profile Entity

Kreirati `services/auth/src/entities/Profile.entity.ts`:

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn
} from 'typeorm';
import { User } from './User.entity';

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'first_name', length: 100, nullable: true })
  firstName: string | null;

  @Column({ name: 'last_name', length: 100, nullable: true })
  lastName: string | null;

  // Relaciona veza
  @OneToOne(() => User, user => user.profile)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
```

### 2.4 Primer: Student Entity (sa JSONB)

Kreirati `services/auth/src/entities/Student.entity.ts`:

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  OneToMany
} from 'typeorm';
import { User } from './User.entity';
import { Parent } from './Parent.entity';
import { QuizAttempt } from './QuizAttempt.entity';

export interface AccessibilitySettings {
  fontSize?: 'small' | 'medium' | 'large';
  highContrast?: boolean;
  screenReader?: boolean;
  dyslexiaFont?: boolean;
}

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({
    name: 'accessibility_settings',
    type: 'jsonb',
    nullable: true
  })
  accessibilitySettings: AccessibilitySettings | null;

  // Relacije
  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToMany(() => Parent, parent => parent.students)
  parents: Parent[];

  @OneToMany(() => QuizAttempt, attempt => attempt.student)
  quizAttempts: QuizAttempt[];
}
```

### 2.5 Ostali Entiteti - Šablon

Za **Teacher, Parent, Lesson, Quiz, QuizAttempt** koristiti slične principe:

- `@ManyToOne` - Više studenata ima jednog učitelja
- `@OneToMany` - Jedan učitelj ima više lekcija
- `@ManyToMany` - Više roditelja može imati više dece (sa junction tabelom)
- `@JoinTable` - Koristi se na vlasničkoj strani Many-to-Many veze
- `@JoinColumn` - Definiše foreign key kolonu

**Kompletne primere entiteta kreirati po uzoru na postojeću šemu iz `001_mvp_schema.sql`.**

---

## Faza 3: Generisanje Inicijalnih Migracija

### 3.1 Priprema

Pre generisanja migracija:

1. **Backup postojeće baze:**
```bash
docker exec lumolearn-postgres pg_dump -U lumolearn lumolearn > backup_before_typeorm.sql
```

2. **Kreirati prazan migration direktorijum:**
```bash
mkdir -p services/auth/migrations
```

### 3.2 Generisanje Migracije iz Entiteta

```bash
cd services/auth
npm run migration:generate -- -d src/config/typeorm.config.ts -n InitialSchema
```

**Rezultat:** Kreira fajl `services/auth/migrations/{timestamp}-InitialSchema.ts`

### 3.3 Analiza Generisane Migracije

Otvoriti generisani fajl i proveriti:

1. Da li su sve tabele obuhvaćene?
2. Da li su foreign key constraints pravilni?
3. Da li su indeksi postavljeni?
4. Da li nedostaje test user seed data?

**Primer strukture:**

```typescript
import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1234567890123 implements MigrationInterface {
    name = 'InitialSchema1234567890123'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // CREATE TABLE statements...
        // ALTER TABLE statements...
        // CREATE INDEX statements...
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // DROP INDEX statements...
        // DROP TABLE statements...
    }
}
```

### 3.4 Dodavanje Seed Data (Test User)

Ako treba seed data, dodati na kraj `up()` metode:

```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
  // ... postojeće CREATE TABLE statements ...

  // Seed test user
  await queryRunner.query(`
    INSERT INTO users (id, email, password_hash, role, created_at)
    VALUES (
      'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
      'test@lumolearn.com',
      '$2b$10$...',
      'student',
      NOW()
    )
    ON CONFLICT (email) DO NOTHING;
  `);
}
```

### 3.5 Testiranje na Novoj Bazi

**Opcija A: Nova test baza**

```bash
# Kreirati novu test bazu
docker exec -it lumolearn-postgres psql -U lumolearn -c "CREATE DATABASE lumolearn_test;"

# Update .env sa TEST DATABASE_URL
# DATABASE_URL=postgresql://lumolearn:lumolearn@localhost:5432/lumolearn_test

# Pokrenuti migracije
npm run migration:run
```

**Opcija B: Drop i re-create postojeće baze**

⚠️ **UPOZORENJE: Ovo briše SVE podatke!**

```bash
# Samo za development!
npm run schema:drop
npm run migration:run
```

### 3.6 Verifikacija

Proveriti bazu sa psql:

```bash
docker exec -it lumolearn-postgres psql -U lumolearn -d lumolearn

# U psql:
\dt          # Lista tabela
\d users     # Detalji users tabele
\di          # Lista indeksa
```

---

## Faza 4: Refaktorisanje Database Operacija

### 4.1 Kreiranje Repository Servisa

Kreirati `services/auth/src/repositories/UserRepository.ts`:

```typescript
import { AppDataSource } from '../config/typeorm.config';
import { User } from '../entities/User.entity';

export const UserRepository = AppDataSource.getRepository(User).extend({
  // Custom metoda: Pronađi po email-u
  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({
      where: { email },
      relations: ['profile']
    });
  },

  // Custom metoda: Kreiranje korisnika
  async createUser(email: string, password: string, role: string): Promise<User> {
    const user = this.create({
      email,
      passwordHash: password, // BeforeInsert hook će hash-ovati
      role: role as any
    });

    return this.save(user);
  },

  // Custom metoda: Provera postojanja
  async emailExists(email: string): Promise<boolean> {
    const count = await this.count({ where: { email } });
    return count > 0;
  }
});
```

### 4.2 Update Auth Controller-a

Update `services/auth/src/controllers/authController.ts`:

**BILO:**
```typescript
import { findByEmail, createUser, verifyPassword } from '../models/User';
```

**POSTAJE:**
```typescript
import { AppDataSource } from '../config/typeorm.config';
import { User } from '../entities/User.entity';
import { UserRepository } from '../repositories/UserRepository';

const userRepo = AppDataSource.getRepository(User);
// ili koristiti custom repository:
// const userRepo = UserRepository;
```

**Primer izmene u register funkciji:**

**BILO:**
```typescript
export const register = async (req: Request, res: Response) => {
  const { email, password, role } = req.body;

  const existingUser = await findByEmail(email);
  if (existingUser) {
    return res.status(400).json({ message: 'Email already registered' });
  }

  const user = await createUser({ email, password, role });
  // ...
};
```

**POSTAJE:**
```typescript
export const register = async (req: Request, res: Response) => {
  const { email, password, role } = req.body;

  const existingUser = await userRepo.findByEmail(email);
  if (existingUser) {
    return res.status(400).json({ message: 'Email already registered' });
  }

  const user = await userRepo.createUser(email, password, role);
  // ...
};
```

### 4.3 Update Login Funkcije

**BILO:**
```typescript
const user = await findByEmail(email);
if (!user || !(await verifyPassword(user.id, password))) {
  return res.status(401).json({ message: 'Invalid credentials' });
}
```

**POSTAJE:**
```typescript
const user = await userRepo.findByEmail(email);
if (!user || !(await user.verifyPassword(password))) {
  return res.status(401).json({ message: 'Invalid credentials' });
}
```

### 4.4 Dependency Injection Pattern (Opciono)

Za bolju testabilnost, kreirati servis:

`services/auth/src/services/AuthService.ts`:

```typescript
import { Repository } from 'typeorm';
import { User } from '../entities/User.entity';
import * as jwt from 'jsonwebtoken';

export class AuthService {
  constructor(private userRepository: Repository<User>) {}

  async register(email: string, password: string, role: string) {
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const user = this.userRepository.create({
      email,
      passwordHash: password,
      role: role as any
    });

    return this.userRepository.save(user);
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user || !(await user.verifyPassword(password))) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    return { token, user };
  }
}
```

---

## Faza 5: Testiranje i Validacija

### 5.1 Unit Testovi za Entitete

Kreirati `services/auth/tests/entities/User.test.ts`:

```typescript
import { User, UserRole } from '../../src/entities/User.entity';
import * as bcrypt from 'bcrypt';

describe('User Entity', () => {
  it('should hash password before insert', async () => {
    const user = new User();
    user.email = 'test@example.com';
    user.passwordHash = 'plaintext';

    await user.hashPassword();

    expect(user.passwordHash).not.toBe('plaintext');
    expect(user.passwordHash.startsWith('$2b$')).toBe(true);
  });

  it('should verify password correctly', async () => {
    const user = new User();
    user.passwordHash = await bcrypt.hash('password123', 10);

    const isValid = await user.verifyPassword('password123');
    expect(isValid).toBe(true);

    const isInvalid = await user.verifyPassword('wrongpassword');
    expect(isInvalid).toBe(false);
  });
});
```

### 5.2 Integration Testovi sa TypeORM

Kreirati test DataSource:

`services/auth/tests/config/test-db.config.ts`:

```typescript
import { DataSource } from 'typeorm';

export const TestDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'lumolearn',
  password: 'lumolearn',
  database: 'lumolearn_test',
  synchronize: true, // OK za test bazu
  dropSchema: true,  // Očisti pre svakog test run-a
  entities: ['src/entities/**/*.entity.ts'],
  logging: false
});
```

### 5.3 API Testovi

Update postojećih testova da koriste TypeORM:

```typescript
import { AppDataSource } from '../../src/config/typeorm.config';

beforeAll(async () => {
  await AppDataSource.initialize();
});

afterAll(async () => {
  await AppDataSource.destroy();
});

beforeEach(async () => {
  // Očisti tabele između testova
  const entities = AppDataSource.entityMetadatas;
  for (const entity of entities) {
    const repository = AppDataSource.getRepository(entity.name);
    await repository.query(`TRUNCATE TABLE "${entity.tableName}" CASCADE;`);
  }
});
```

### 5.4 Manuelno Testiranje

```bash
# 1. Testirati registraciju
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"new@test.com","password":"pass123","role":"student"}'

# 2. Testirati login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"new@test.com","password":"pass123"}'

# 3. Proveriti bazu
docker exec -it lumolearn-postgres psql -U lumolearn -d lumolearn -c "SELECT * FROM users;"
```

---

## Faza 6: Workflow za Buduće Izmene

### 6.1 Proces Izmene Šeme

**Scenario: Dodavanje novog polja u User entitet**

1. **Izmena entiteta:**

```typescript
// services/auth/src/entities/User.entity.ts
@Entity('users')
export class User {
  // ... postojeća polja ...

  @Column({ name: 'phone_number', length: 20, nullable: true })
  phoneNumber: string | null;
}
```

2. **Generisanje migracije:**

```bash
npm run migration:generate -- -d src/config/typeorm.config.ts -n AddPhoneNumberToUsers
```

3. **Pregled generisane migracije:**

```typescript
// migrations/{timestamp}-AddPhoneNumberToUsers.ts
public async up(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(`
    ALTER TABLE "users"
    ADD "phone_number" character varying(20)
  `);
}
```

4. **Pokretanje migracije:**

```bash
npm run migration:run
```

5. **Provera statusa:**

```bash
npm run migration:show
```

### 6.2 Kreiranje Prazne Migracije (za seed data, složene izmene)

```bash
npm run migration:create -- migrations/SeedDefaultData
```

Ručno dodati logiku:

```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(`
    INSERT INTO lessons (id, teacher_id, title, content_id, is_published)
    VALUES
      (uuid_generate_v4(), 'teacher-uuid', 'Default Lesson 1', 'content-1', false),
      (uuid_generate_v4(), 'teacher-uuid', 'Default Lesson 2', 'content-2', false);
  `);
}
```

### 6.3 Rollback Strategija

```bash
# Vrati poslednju migraciju
npm run migration:revert

# Proveri koje migracije su aplicirane
npm run migration:show
```

### 6.4 Dodavanje Nove Relacije

**Primer: Student može imati više adresa**

1. Kreirati novi entitet `Address.entity.ts`
2. Dodati `@OneToMany` u Student entitet
3. Generisati migraciju
4. Pokrenuti migraciju

### 6.5 Production Deployment Checklist

- [ ] Testirati migracije na staging bazi
- [ ] Backup production baze pre deploy-a
- [ ] Pokrenuti migracije na production sa `migration:run`
- [ ] Verifikovati da aplikacija radi posle migracija
- [ ] Monitorovati logove za errors
- [ ] Imati rollback plan (revert migracije + restore backup)

---

## Faza 7: Čišćenje i Dokumentacija

### 7.1 Brisanje Starih Fajlova

Nakon što TypeORM radi ispravno:

```bash
# Premesti stare fajlove u backup folder
mkdir -p services/auth/src/_legacy
mv services/auth/src/models/User.ts services/auth/src/_legacy/
mv services/auth/src/config/database.ts services/auth/src/_legacy/

# Čuvaj stare SQL migracije za referencu
mkdir -p database/migrations/_legacy
mv database/migrations/001_mvp_schema.sql database/migrations/_legacy/
```

### 7.2 Update README.md

Dodati sekciju u `services/auth/README.md`:

```markdown
## Database Migrations

This project uses TypeORM for database management.

### Running Migrations

```bash
# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Show migration status
npm run migration:show
```

### Creating Migrations

```bash
# Generate migration from entity changes
npm run migration:generate -- -d src/config/typeorm.config.ts -n MigrationName

# Create empty migration
npm run migration:create -- migrations/MigrationName
```

### Development Workflow

1. Modify entity classes in `src/entities/`
2. Generate migration: `npm run migration:generate -- -d src/config/typeorm.config.ts -n DescriptiveName`
3. Review generated SQL in `migrations/` folder
4. Run migration: `npm run migration:run`
5. Test changes
```

### 7.3 Team Documentation

Kreirati `services/auth/docs/TYPEORM_GUIDE.md` sa:

- Uputstvo za nove developere
- Primeri čestih operacija
- Best practices
- Troubleshooting guide

---

## Dodatni Resursi

### TypeORM Dokumentacija

- Official Docs: https://typeorm.io/
- Entity Decorators: https://typeorm.io/entities
- Relations: https://typeorm.io/relations
- Migrations: https://typeorm.io/migrations
- Repository API: https://typeorm.io/repository-api
- Query Builder: https://typeorm.io/select-query-builder

### Best Practices

1. **Nikad ne koristi `synchronize: true` u production**
2. **Uvek testuj migracije na staging bazi prvo**
3. **Piši rollback logiku u `down()` metodi**
4. **Koristi transactions za kritične operacije**
5. **Ne brisi stare migracije koje su već u production**

### Korisne TypeORM Komande

```bash
# Prikaz svih komandi
npm run typeorm -- --help

# Sinhronizuj šemu (SAMO ZA DEV!)
npm run schema:sync

# Isprazni bazu (OPASNO!)
npm run schema:drop

# Logovanje svih SQL upita
# Dodaj u typeorm.config.ts: logging: true
```

---

## Troubleshooting

### Problem: "Cannot use import statement outside a module"

**Rešenje:** Proveri da li imaš `ts-node` instaliran i koristi `typeorm-ts-node-commonjs` u npm skriptama.

### Problem: "Reflect.getMetadata is not a function"

**Rešenje:** Dodaj `import 'reflect-metadata';` na vrh glavnog fajla (`index.ts`).

### Problem: "Entity metadata not found"

**Rešenje:** Proveri da li je `entities` path u `typeorm.config.ts` pravilno setovan.

### Problem: Migracije ne detektuju izmene entiteta

**Rešenje:**
1. Proveri da li TypeORM može učitati entitete
2. Pokreni `npm run typeorm schema:log` da vidiš trenutno stanje
3. Uporedi sa bazom ručno

### Problem: "Connection already established"

**Rešenje:** Pozovi `AppDataSource.destroy()` u cleanup kodu (npr. after tests).

---

## Napredne Teme (Za Kasnije)

### Query Builder za Složene Upite

```typescript
const users = await userRepo
  .createQueryBuilder('user')
  .leftJoinAndSelect('user.profile', 'profile')
  .where('user.role = :role', { role: 'student' })
  .andWhere('user.createdAt > :date', { date: new Date('2025-01-01') })
  .orderBy('user.createdAt', 'DESC')
  .limit(10)
  .getMany();
```

### Transactions

```typescript
await AppDataSource.transaction(async (manager) => {
  const user = manager.create(User, { email, passwordHash, role });
  await manager.save(user);

  const profile = manager.create(Profile, { userId: user.id, firstName, lastName });
  await manager.save(profile);
});
```

### Custom Repositories

```typescript
@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async findActiveUsers() {
    return this.find({ where: { isActive: true } });
  }
}
```

### Subscribers (Event Listeners)

```typescript
@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  listenTo() {
    return User;
  }

  afterInsert(event: InsertEvent<User>) {
    console.log(`New user created: ${event.entity.email}`);
  }
}
```

---

## Zaključak

Nakon implementacije TypeORM-a, dobićeš:

✅ Automatsko generisanje migracija iz entiteta
✅ Type-safe database operacije
✅ Repository pattern za čist kod
✅ Rollback mogućnost
✅ Migration tracking
✅ Bolju maintainability na duže staze

**Procenjeno vreme implementacije:**
- Faza 1-2: 2-3 sata (setup + entiteti)
- Faza 3: 1-2 sata (migracije)
- Faza 4: 2-3 sata (refactoring)
- Faza 5: 1-2 sata (testiranje)
- **Ukupno: ~8-12 sati**

Srećno sa implementacijom! 🚀
