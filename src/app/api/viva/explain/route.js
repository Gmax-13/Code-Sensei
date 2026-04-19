/**
 * POST /api/viva/explain
 * ------------------------
 * Generate a structured explanation of submitted code.
 * Protected endpoint — requires authentication.
 */

import { withAuth } from "@/lib/middleware";
import { errorResponse, successResponse } from "@/lib/apiResponse";
import { explainCode } from "@/services/viva/codeExplainer";

async function handler(request, context, user) {
    try {
        const body = await request.json();
        const { code, language } = body;

        if (!code || typeof code !== "string" || !code.trim()) {
            return errorResponse("Code is required.", 400);
        }

        if (code.length > 50000) {
            return errorResponse("Code input too large (max 50,000 characters).", 400);
        }

        const explanation = await explainCode({
            code: code.trim(),
            language: language || "javascript",
        });

        return successResponse({ explanation });
    } catch (error) {
        console.error("Viva explain error:", error);
        return errorResponse("Failed to explain code. Please try again.", 500);
    }
}

export const POST = withAuth(handler);
