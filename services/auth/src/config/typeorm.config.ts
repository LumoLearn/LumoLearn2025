import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import path from 'path';
import { User } from '../entities/User.entity';
import { Profile } from '../entities/Profile.entity';
import { Student } from '../entities/Student.entity';
import { Teacher } from '../entities/Teacher.entity';
import { Parent } from '../entities/Parent.entity';
import { Lesson } from '../entities/Lesson.entity';
import { Quiz } from '../entities/Quiz.entity';
import { QuizAttempt } from '../entities/QuizAttempt.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: false, // IMPORTANT: Always false in production!
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Profile, Student, Teacher, Parent, Lesson, Quiz, QuizAttempt],
  migrations: [path.join(__dirname, '../../migrations/**/*.{ts,js}')],
  subscribers: [],

  // Connection pool settings
  extra: {
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  }
});
