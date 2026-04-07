/**
 * POST /api/report/generate
 * ---------------------------
 * Generate a structured practical report using Groq AI.
 * Accepts title, language, custom headers, and optional source code.
 * Protected endpoint — requires authentication.
 */

import { withAuth } from "@/lib/middleware";
import { reportSchema } from "@/lib/validations";
import { generateReport } from "@/services/reportService";
import { successResponse, errorResponse } from "@/lib/apiResponse";

async function handler(request) {
    try {
        // 1. Validate input
        const body = await request.json();
        const parsed = reportSchema.safeParse(body);

        if (!parsed.success) {
            const message = parsed.error.errors[0]?.message || "Invalid input";
            return errorResponse(message, 400);
        }

        // 2. Generate the report using the AI-powered service
        const report = await generateReport(parsed.data);

        return successResponse({ report });
    } catch (error) {
        console.error("Report generation error:", error);

        // Provide a more specific error message if available
        const message = error.message?.includes("GROQ_API_KEY")
            ? "API key not configured. Please contact the administrator."
            : "Failed to generate report. Please try again.";

        return errorResponse(message, 500);
    }
}

// Wrap with auth — only logged-in users can generate reports
export const POST = withAuth(handler);
