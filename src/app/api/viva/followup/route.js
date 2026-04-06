/**
 * POST /api/viva/followup
 * -------------------------
 * Generate follow-up questions based on a prior Q&A exchange.
 * Protected endpoint — requires authentication.
 */

import { withAuth } from "@/lib/middleware";
import { errorResponse, successResponse } from "@/lib/apiResponse";
import { generateFollowups } from "@/services/viva/followupGenerator";

async function handler(request) {
    try {
        const body = await request.json();
        const { question, answer, code, difficulty } = body;

        if (!question || typeof question !== "string" || !question.trim()) {
            return errorResponse("Original question is required.", 400);
        }

        const result = await generateFollowups({
            question: question.trim(),
            answer: answer || "",
            code: code || "",
            difficulty: difficulty || "medium",
        });

        return successResponse({ followup: result });
    } catch (error) {
        console.error("Viva followup error:", error);
        return errorResponse("Failed to generate follow-ups. Please try again.", 500);
    }
}

export const POST = withAuth(handler);
