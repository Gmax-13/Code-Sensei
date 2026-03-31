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

async function handler(request) {
    try {
        await dbConnect();

        // request.user is injected by the auth middleware
        const user = await User.findById(request.user.userId);
        if (!user) {
            return errorResponse("User not found.", 404);
        }

        return successResponse({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        console.error("Get user error:", error);
        return errorResponse("Internal server error.", 500);
    }
}

// Wrap the handler with auth middleware
export const GET = withAuth(handler);
