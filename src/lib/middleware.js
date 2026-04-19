/**
 * Auth Middleware
 * ----------------
 * Protects API routes by verifying the JWT token from the HTTP-only cookie.
 *
 * Changes from previous version:
 *  1. Uses NextRequest.cookies.get() instead of manually regex-parsing the
 *     raw Cookie header — more robust, handles edge-case header formats.
 *  2. Does NOT mutate request.user. Instead, the decoded user context is
 *     passed as a third argument to the handler: handler(request, context, user).
 *     This makes the auth contract explicit and avoids silent failures when
 *     request mutation is stripped by the runtime.
 *  3. Supports optional role-based access control via options.roles.
 */

import { verifyToken } from "./auth";
import { errorResponse } from "./apiResponse";

/**
 * Wraps an API route handler with JWT authentication.
 *
 * The wrapped handler receives the decoded user as its third argument:
 *   async function handler(request, context, user) { ... }
 *
 * Where user = { userId, email, role }
 *
 * @param {Function} handler - Route handler: (request, context, user) => Response
 * @param {Object}   options
 * @param {string[]} [options.roles] - If set, only these roles are allowed
 * @returns {Function} Next.js-compatible route handler
 */
export function withAuth(handler, options = {}) {
    return async (request, context) => {
        try {
            // Use NextRequest's built-in cookies API — avoids manual header parsing
            const token = request.cookies?.get("token")?.value ?? null;

            if (!token) {
                return errorResponse("Authentication required. Please log in.", 401);
            }

            // Verify the JWT and extract the payload
            const decoded = verifyToken(token);
            if (!decoded) {
                return errorResponse("Invalid or expired token.", 401);
            }

            // Optional role-based access control
            if (options.roles && options.roles.length > 0) {
                if (!options.roles.includes(decoded.role)) {
                    return errorResponse("Insufficient permissions.", 403);
                }
            }

            // Pass user as an explicit third argument — no request mutation
            const user = {
                userId: decoded.userId,
                email:  decoded.email,
                role:   decoded.role,
            };

            return handler(request, context, user);
        } catch (error) {
            console.error("Auth middleware error:", error);
            return errorResponse("Authentication failed.", 500);
        }
    };
}
