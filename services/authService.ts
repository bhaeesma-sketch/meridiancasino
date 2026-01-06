// Authentication Service
// Handles JWT token generation and verification
// NOTE: This service is designed for server-side use only.
// On client-side, tokens are passed but not generated/verified.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let jwt: any;
try {
    // Dynamic import for server-side only
    jwt = require('jsonwebtoken');
} catch {
    // Mock for client-side - actual JWT operations happen on server
    jwt = {
        sign: () => { throw new Error('JWT operations not available on client'); },
        verify: () => { throw new Error('JWT operations not available on client'); },
        decode: () => null
    };
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = '1h';

interface JWTPayload {
    userId: string;
    walletAddress: string;
    iat?: number;
    exp?: number;
}

/**
 * Generate JWT token for authenticated user
 */
export function generateJWT(userId: string, walletAddress: string): string {
    return jwt.sign(
        { userId, walletAddress },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
    );
}

/**
 * Verify and decode JWT token
 */
export function verifyJWT(token: string): JWTPayload | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
        return decoded;
    } catch (error) {
        console.error('JWT verification failed:', error);
        return null;
    }
}

/**
 * Check if JWT token is expired
 */
export function isTokenExpired(token: string): boolean {
    try {
        const decoded = jwt.decode(token) as JWTPayload;
        if (!decoded || !decoded.exp) return true;

        return Date.now() >= decoded.exp * 1000;
    } catch {
        return true;
    }
}
