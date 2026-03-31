/**
 * POST /api/auth/register
 * -------------------------
 * Register a new user. Validates input with Zod, checks for
 * duplicate emails, hashes the password, and returns a JWT
 * in an HTTP-only cookie.
 */

import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { registerSchema } from "@/lib/validations";
import { signToken, createAuthCookie } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export async function POST(request) {
    try {
        await dbConnect();

        // 1. Parse and validate input
        const body = await request.json();
        const parsed = registerSchema.safeParse(body);

        if (!parsed.success) {
            // Return the first validation error message
            const message = parsed.error.errors[0]?.message || "Invalid input";
            return errorResponse(message, 400);
        }

        const { name, email, password } = parsed.data;

        // 2. Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return errorResponse("An account with this email already exists.", 409);
        }

        // 3. Create the new user (password is hashed in pre-save hook)
        const user = await User.create({ name, email, password });

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
            201,
            { "Set-Cookie": cookie }
        );
    } catch (error) {
        console.error("Register error:", error);
        return errorResponse("Internal server error. Please try again.", 500);
    }
}
