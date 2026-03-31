/**
 * POST /api/auth/logout
 * -----------------------
 * Log out the current user by clearing the auth cookie.
 */

import { successResponse } from "@/lib/apiResponse";
import { clearAuthCookie } from "@/lib/auth";

export async function POST() {
    // Clear the authentication cookie
    const cookie = clearAuthCookie();

    return successResponse(
        { message: "Logged out successfully" },
        200,
        { "Set-Cookie": cookie }
    );
}
