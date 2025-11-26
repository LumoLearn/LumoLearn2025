import { Router } from 'express';
import { healthCheck, databaseHealthCheck } from '../controllers/healthController';

/**
 * Health Check Routes
 *
 * Public routes for service health monitoring
 */

const router = Router();

// Basic health check
router.get('/', healthCheck);

// Database health check
router.get('/db', databaseHealthCheck);

export default router;
