/**
 * POST /api/convert/latex
 * -------------------------
 * Accepts structured report JSON and returns a LaTeX file.
 * Protected endpoint — requires authentication.
 */

import { withAuth } from "@/lib/middleware";
import { errorResponse } from "@/lib/apiResponse";
import { convertToLatex } from "@/services/conversion/latexService";

async function handler(request) {
    try {
        const body = await request.json();

        if (!body || !body.title) {
            return errorResponse("Invalid report data. Title is required.", 400);
        }

        const latex = convertToLatex(body);

        return new Response(latex, {
            status: 200,
            headers: {
                "Content-Type": "application/x-latex; charset=utf-8",
                "Content-Disposition": `attachment; filename="${body.title || "report"}.tex"`,
            },
        });
    } catch (error) {
        console.error("LaTeX conversion error:", error);
        return errorResponse("Failed to generate LaTeX.", 500);
    }
}

export const POST = withAuth(handler);
