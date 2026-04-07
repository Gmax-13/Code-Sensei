/**
 * POST /api/convert/pdf
 * ----------------------
 * Accepts structured report JSON and returns a PDF file.
 * Protected endpoint — requires authentication.
 */

import { withAuth } from "@/lib/middleware";
import { errorResponse } from "@/lib/apiResponse";
import { convertToPdf } from "@/services/conversion/pdfService";

async function handler(request) {
    try {
        const body = await request.json();

        if (!body || !body.title) {
            return errorResponse("Invalid report data. Title is required.", 400);
        }

        const pdfBytes = await convertToPdf(body);

        return new Response(pdfBytes, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${body.title || "report"}.pdf"`,
            },
        });
    } catch (error) {
        console.error("PDF conversion error:", error);
        return errorResponse("Failed to generate PDF.", 500);
    }
}

export const POST = withAuth(handler);
