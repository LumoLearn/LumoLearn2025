import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';

/**
 * JWT Payload interface
 */
interface JWTPayload {
  userId: string;
  email: string;
  role: 'student' | 'teacher' | 'parent';
  iat?: number;
  exp?: number;
}

/**
 * Extended Request interface with user property
 */
interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: 'student' | 'teacher' | 'parent';
  };
}

/**
 * Middleware za autentifikaciju JWT tokena
 * Čita token iz Authorization header-a i verifikuje ga
 * Dodaje user info na request objekat
 */
export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Čitaj Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.substring(7) // Ukloni "Bearer " prefix
      : null;

    // Ako nema tokena
    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
      return;
    }

    // Proveri da li postoji JWT_SECRET
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not defined in environment variables');
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
      return;
    }

    // Verifikuj token
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

    // Dodaj user info na request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };

    // Nastavi sa sledećim middleware-om
    next();
  } catch (error) {
    // Token je invalid ili expired
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: 'Token expired'
      });
      return;
    }

    // Ostali errori
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Middleware za proveru uloge korisnika
 * Zahteva da authenticateToken middleware bude pozvan pre ovoga
 * 
 * @param allowedRoles - Niz dozvoljenih uloga
 * @returns Express middleware funkcija
 */
export const requireRole = (allowedRoles: Array<'student' | 'teacher' | 'parent'>) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    // Proveri da li user postoji na request objektu
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    // Proveri da li user ima dozvoljenu ulogu
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `Access denied. Required role: ${allowedRoles.join(' or ')}`
      });
      return;
    }

    // User ima dozvoljenu ulogu
    next();
  };
};

/**
 * Helper funkcija za generisanje JWT tokena
 * Koristi se u login i registration kontrolerima
 * 
 * @param payload - User info (userId, email, role)
 * @returns JWT token string
 */
export const generateToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '15m';

  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  // Cast to any to avoid TypeScript issues with jsonwebtoken types
  const signOptions: any = {
    expiresIn: jwtExpiresIn
  };

  return jwt.sign(payload, jwtSecret, signOptions);
};

