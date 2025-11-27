import 'reflect-metadata'; // MUST be first import!
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import studentRoutes from './routes/studentRoutes';
import userRoutes from './routes/userRoutes';
import { AppDataSource } from './config/typeorm.config';
import { User } from './entities/User.entity';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'auth-service' });
});

// Database connection test (TypeORM version)
app.get('/health/db', async (req, res) => {
  try {
    const result = await AppDataSource.query('SELECT NOW() as now');
    const userRepo = AppDataSource.getRepository(User);
    const count = await userRepo.count();
    res.json({
      status: 'OK',
      database: 'connected',
      orm: 'TypeORM',
      time: result[0].now,
      usersCount: count
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ status: 'ERROR', database: 'disconnected', error: errorMessage });
  }
});

// Initialize TypeORM before starting the server
AppDataSource.initialize()
  .then(() => {
    console.log('✓ TypeORM: Database connection established');

    app.listen(PORT, () => {
      console.log(`✓ Auth service running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('✗ TypeORM: Database connection failed:', error);
    process.exit(1);
  });

