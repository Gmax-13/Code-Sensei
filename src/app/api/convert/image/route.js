/**
 * POST /api/convert/image
 * -------------------------
 * Accepts structured report JSON and returns an SVG image.
 * Protected endpoint — requires authentication.
 */

import { withAuth } from "@/lib/middleware";
import { errorResponse } from "@/lib/apiResponse";
import { convertToImage } from "@/services/conversion/imageService";

async function handler(request) {
    try {
        const body = await request.json();

        if (!body || !body.title) {
            return errorResponse("Invalid report data. Title is required.", 400);
        }

        const svg = convertToImage(body);

        return new Response(svg, {
            status: 200,
            headers: {
                "Content-Type": "image/svg+xml",
                "Content-Disposition": `attachment; filename="${body.title || "report"}.svg"`,
            },
        });
    } catch (error) {
        console.error("Image conversion error:", error);
        return errorResponse("Failed to generate image.", 500);
    }
}

export const POST = withAuth(handler);
