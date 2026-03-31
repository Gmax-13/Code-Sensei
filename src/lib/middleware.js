/**
 * Auth Middleware
 * ----------------
 * Protects API routes by verifying the JWT token from cookies.
 * Extracts user info and passes it to the route handler.
 * Supports role-based access control.
 */

import { verifyToken } from "./auth";
import { errorResponse } from "./apiResponse";

/**
 * Wraps an API route handler with authentication.
 * Reads the JWT from HTTP-only cookies, verifies it,
 * and injects the decoded user into the handler's params.
 *
 * @param {Function} handler - The route handler function(request, context)
 * @param {Object} options - Options like { roles: ["admin"] }
 * @returns {Function} A wrapped handler with auth protection
 */
export function withAuth(handler, options = {}) {
    return async (request, context) => {
        try {
            // Extract token from cookies
            const cookieHeader = request.headers.get("cookie") || "";
            const tokenMatch = cookieHeader.match(/token=([^;]+)/);
            const token = tokenMatch ? tokenMatch[1] : null;

            if (!token) {
                return errorResponse("Authentication required. Please log in.", 401);
            }

            // Verify the JWT
            const decoded = verifyToken(token);
            if (!decoded) {
                return errorResponse("Invalid or expired token.", 401);
            }

            // Role-based access control
            if (options.roles && options.roles.length > 0) {
                if (!options.roles.includes(decoded.role)) {
                    return errorResponse("Insufficient permissions.", 403);
                }
            }

            // Attach user info to the request for downstream usage
            request.user = {
                userId: decoded.userId,
                email: decoded.email,
                role: decoded.role,
            };

            return handler(request, context);
        } catch (error) {
            console.error("Auth middleware error:", error);
            return errorResponse("Authentication failed.", 500);
        }
    };
}
