/**
 * GET /api/user/me
 * ------------------
 * Returns the currently authenticated user's profile.
 * Protected by auth middleware — requires valid JWT cookie.
 */

import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { withAuth } from "@/lib/middleware";
import { successResponse, errorResponse } from "@/lib/apiResponse";

async function handler(request, context, user) {
    try {
        await dbConnect();

        // user is passed explicitly by withAuth — no request mutation needed
        if (!user?.userId) {
            return errorResponse("Authentication context missing.", 401);
        }

        const found = await User.findById(user.userId);
        if (!found) {
            return errorResponse("User not found.", 404);
        }

        return successResponse({
            user: {
                id: found._id,
                name: found.name,
                email: found.email,
                role: found.role,
                createdAt: found.createdAt,
            },
        });
    } catch (error) {
        console.error("Get user error:", error);
        return errorResponse("Internal server error.", 500);
    }
}

// Wrap the handler with auth middleware
export const GET = withAuth(handler);
