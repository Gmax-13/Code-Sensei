/**
 * POST /api/convert/markdown
 * ----------------------------
 * Accepts structured report JSON and returns a Markdown file.
 * Protected endpoint — requires authentication.
 */

import { withAuth } from "@/lib/middleware";
import { errorResponse, sanitizeFilename } from "@/lib/apiResponse";
import { convertToMarkdown } from "@/services/conversion/markdownService";

async function handler(request) {
    try {
        const body = await request.json();

        if (!body || !body.title) {
            return errorResponse("Invalid report data. Title is required.", 400);
        }

        const markdown = convertToMarkdown(body);

        return new Response(markdown, {
            status: 200,
            headers: {
                "Content-Type": "text/markdown; charset=utf-8",
                "Content-Disposition": `attachment; filename="${sanitizeFilename(body.title)}.md"`,
            },
        });
    } catch (error) {
        console.error("Markdown conversion error:", error);
        return errorResponse("Failed to generate Markdown.", 500);
    }
}

export const POST = withAuth(handler);
