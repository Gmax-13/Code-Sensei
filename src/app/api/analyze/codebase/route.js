/**
 * POST /api/analyze/codebase
 * ----------------------------
 * Analyze uploaded codebase files and return a summary.
 * Protected endpoint — requires authentication.
 */

import { withAuth } from "@/lib/middleware";
import { codebaseSchema } from "@/lib/validations";
import { analyzeCodebase } from "@/services/codebaseService";
import { successResponse, errorResponse } from "@/lib/apiResponse";

async function handler(request) {
    try {
        // 1. Validate input
        const body = await request.json();
        const parsed = codebaseSchema.safeParse(body);

        if (!parsed.success) {
            const message = parsed.error.errors[0]?.message || "Invalid input";
            return errorResponse(message, 400);
        }

        // 2. Analyze the codebase via service layer
        const analysis = analyzeCodebase(parsed.data.files);

        return successResponse({ analysis });
    } catch (error) {
        console.error("Codebase analysis error:", error);
        return errorResponse("Failed to analyze codebase. Please try again.", 500);
    }
}

export const POST = withAuth(handler);
