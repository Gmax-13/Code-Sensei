export async function GET() {
  return new Response(JSON.stringify({ message: "API working" }), {
    status: 200,
  });
}