/**
 * POST /api/viva/generate
 * -------------------------
 * Generate interview/viva questions from submitted code.
 * Protected endpoint — requires authentication.
 */

import { withAuth } from "@/lib/middleware";
import { errorResponse, successResponse } from "@/lib/apiResponse";
import { generateQuestions } from "@/services/viva/questionGenerator";

async function handler(request, context, user) {
    try {
        const body = await request.json();
        const { code, language, difficulty } = body;

        if (!code || typeof code !== "string" || !code.trim()) {
            return errorResponse("Code is required.", 400);
        }

        if (code.length > 50000) {
            return errorResponse("Code input too large (max 50,000 characters).", 400);
        }

        const validDifficulties = ["easy", "medium", "hard"];
        const safeDifficulty = validDifficulties.includes(difficulty) ? difficulty : "medium";

        const questions = await generateQuestions({
            code: code.trim(),
            difficulty: safeDifficulty,
        });

        return successResponse({ questions });
    } catch (error) {
        console.error("Viva generate error:", error);
        return errorResponse("Failed to generate questions. Please try again.", 500);
    }
}

export const POST = withAuth(handler);
