/**
 * JWT Authentication Utilities
 * -----------------------------
 * Provides helper functions to sign, verify, and manage
 * JWT tokens stored in HTTP-only cookies for secure auth.
 */

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

/**
 * Sign a JWT token with the given payload.
 * @param {Object} payload - Data to encode (e.g., { userId, role })
 * @returns {string} Signed JWT token
 */
export function signToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify and decode a JWT token.
 * @param {string} token - The JWT token string
 * @returns {Object|null} Decoded payload or null if invalid
 */
export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
}

/**
 * Create a serialized Set-Cookie header value for the auth token.
 * Uses HTTP-only, Secure, SameSite=Lax for security.
 *
 * @param {string} token - JWT token to store
 * @param {number} maxAgeDays - Cookie lifetime in days (default 7)
 * @returns {string} Serialized cookie string
 */
export function createAuthCookie(token, maxAgeDays = 7) {
    const maxAge = maxAgeDays * 24 * 60 * 60; // Convert days to seconds
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    return `token=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

/**
 * Create a Set-Cookie header that expires/removes the auth cookie.
 * @returns {string} Serialized cookie string that clears the token
 */
export function clearAuthCookie() {
    return `token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`;
}
