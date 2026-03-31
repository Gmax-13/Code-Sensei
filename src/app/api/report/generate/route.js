/**
 * POST /api/report/generate
 * ---------------------------
 * Generate a structured practical report from code input.
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

        // 2. Generate the report using the service layer
        const report = generateReport(parsed.data);

        return successResponse({ report });
    } catch (error) {
        console.error("Report generation error:", error);
        return errorResponse("Failed to generate report. Please try again.", 500);
    }
}

// Wrap with auth — only logged-in users can generate reports
export const POST = withAuth(handler);
