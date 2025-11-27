/// <reference path="../types/express.d.ts" />
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

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
 * User roles type
 */
export type UserRole = 'student' | 'teacher' | 'parent';

/**
 * Authenticated user info attached to request
 */
export interface AuthUser {
  userId: string;
  email: string;
  role: UserRole;
}

/**
 * Middleware za autentifikaciju JWT tokena
 * Čita token iz Authorization header-a i verifikuje ga
 * Dodaje user info na request objekat
 */
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Čitaj Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : null;

    // Ako nema tokena
    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.',
      });
      return;
    }

    // Proveri da li postoji JWT_SECRET
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not defined in environment variables');
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
      return;
    }

    // Verifikuj token
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

    // Dodaj user info na request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: 'Invalid token',
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: 'Token expired',
      });
      return;
    }

    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Middleware za proveru uloge korisnika
 * Zahteva da authenticateToken middleware bude pozvan pre ovoga
 *
 * @param allowedRoles - Niz dozvoljenih uloga
 */
export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
      });
      return;
    }

    next();
  };
};

/**
 * Kombinovani middleware za autentifikaciju i proveru uloge
 */
export const requireAuth = (...allowedRoles: UserRole[]) => {
  if (allowedRoles.length === 0) {
    return authenticateToken;
  }
  
  return [authenticateToken, requireRole(allowedRoles)];
};

