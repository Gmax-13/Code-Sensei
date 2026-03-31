/**
 * POST /api/diagram/generate
 * ----------------------------
 * Generate Mermaid.js diagrams from source code.
 * Protected endpoint — requires authentication.
 */

import { withAuth } from "@/lib/middleware";
import { diagramSchema } from "@/lib/validations";
import { generateDiagram } from "@/services/diagramService";
import { successResponse, errorResponse } from "@/lib/apiResponse";

async function handler(request) {
    try {
        // 1. Validate input
        const body = await request.json();
        const parsed = diagramSchema.safeParse(body);

        if (!parsed.success) {
            const message = parsed.error.errors[0]?.message || "Invalid input";
            return errorResponse(message, 400);
        }

        // 2. Generate diagrams via service layer
        const diagrams = generateDiagram(parsed.data);

        return successResponse({ diagrams });
    } catch (error) {
        console.error("Diagram generation error:", error);
        return errorResponse("Failed to generate diagrams. Please try again.", 500);
    }
}

export const POST = withAuth(handler);
