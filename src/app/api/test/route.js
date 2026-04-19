/**
 * GET /api/test
 * -----------------
 * Simple health-check endpoint — verifies the API layer is reachable.
 * Previously broken because the file was named test.js instead of route.js.
 * Next.js App Router only registers files named route.js as API endpoints.
 */

export async function GET() {
    return new Response(JSON.stringify({ message: "API working" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
}
