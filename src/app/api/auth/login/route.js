/**
 * POST /api/auth/login
 * ----------------------
 * Authenticate a user with email and password.
 * Returns a JWT in an HTTP-only cookie on success.
 */

import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { loginSchema } from "@/lib/validations";
import { signToken, createAuthCookie } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export async function POST(request) {
    try {
        await dbConnect();

        // 1. Parse and validate input
        const body = await request.json();
        const parsed = loginSchema.safeParse(body);

        if (!parsed.success) {
            const message = parsed.error.errors[0]?.message || "Invalid input";
            return errorResponse(message, 400);
        }

        const { email, password } = parsed.data;

        // 2. Find user and include the password field (excluded by default)
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            // Use generic message to prevent email enumeration
            return errorResponse("Invalid email or password.", 401);
        }

        // 3. Compare the provided password with the stored hash
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return errorResponse("Invalid email or password.", 401);
        }

        // 4. Generate JWT and set cookie
        const token = signToken({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        });

        const cookie = createAuthCookie(token);

        return successResponse(
            {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            },
            200,
            { "Set-Cookie": cookie }
        );
    } catch (error) {
        console.error("Login error:", error);
        return errorResponse("Internal server error. Please try again.", 500);
    }
}
