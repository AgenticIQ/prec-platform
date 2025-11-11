// Authentication utility functions
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  type: 'client' | 'admin';
}

/**
 * Verify JWT token from request
 */
export function verifyToken(request: NextRequest): AuthUser | null {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(request: NextRequest): boolean {
  return verifyToken(request) !== null;
}

/**
 * Check if user is admin
 */
export function isAdmin(request: NextRequest): boolean {
  const user = verifyToken(request);
  return user?.type === 'admin';
}

/**
 * Get current user from request
 */
export function getCurrentUser(request: NextRequest): AuthUser | null {
  return verifyToken(request);
}
