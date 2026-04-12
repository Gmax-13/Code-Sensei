/**
 * POST /api/ai/annotate
 * -----------------------
 * Generates an instant, on-demand AI annotation for a specific DSA step.
 * Powered by Groq for <300ms latency.
 */

import { withAuth } from "@/lib/middleware";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { generateFast } from "@/lib/groqClient";

async function handler(request) {
    try {
        const body = await request.json();
        const { algorithm, stepDescription, stepIndex, context } = body;

        if (!algorithm || !stepDescription) {
            return errorResponse("Algorithm and stepDescription are required.", 400);
        }

        const prompt = `You are a technical assistant explaining a data structures and algorithms visualization step.
Algorithm: ${algorithm}
Current step description: ${stepDescription}
Context of recent execution if any: ${context || "None"}

Write exactly ONE concise, student-friendly sentence (max 20 words) explaining WHY this step is happening based on the rules of ${algorithm}. Do NOT repeat the step description, tell me the "why". Return ONLY the sentence, nothing else.`;

        const annotation = await generateFast(prompt);

        return successResponse({ annotation: annotation.trim() });
    } catch (error) {
        console.error("Groq annotation error:", error);
        return errorResponse("Failed to generate annotation.", 500);
    }
}

export const POST = withAuth(handler);
