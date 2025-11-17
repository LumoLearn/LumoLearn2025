import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import pool from './config/database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'auth-service' });
});

// Database connection test
app.get('/health/db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    const users = await pool.query('SELECT COUNT(*) as count FROM users');
    res.json({ 
      status: 'OK', 
      database: 'connected', 
      time: result.rows[0].now,
      usersCount: users.rows[0].count
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ status: 'ERROR', database: 'disconnected', error: errorMessage });
  }
});

app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
});

