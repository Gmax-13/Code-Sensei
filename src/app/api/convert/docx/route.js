/**
 * POST /api/convert/docx
 * -----------------------
 * Accepts structured report JSON and returns a DOCX file.
 * Protected endpoint — requires authentication.
 */

import { withAuth } from "@/lib/middleware";
import { errorResponse, sanitizeFilename } from "@/lib/apiResponse";
import { convertToDocx } from "@/services/conversion/docxService";

async function handler(request) {
    try {
        const body = await request.json();

        if (!body || !body.title) {
            return errorResponse("Invalid report data. Title is required.", 400);
        }

        const buffer = await convertToDocx(body);

        return new Response(buffer, {
            status: 200,
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "Content-Disposition": `attachment; filename="${sanitizeFilename(body.title)}.docx"`,
            },
        });
    } catch (error) {
        console.error("DOCX conversion error:", error);
        return errorResponse("Failed to generate DOCX.", 500);
    }
}

export const POST = withAuth(handler);
