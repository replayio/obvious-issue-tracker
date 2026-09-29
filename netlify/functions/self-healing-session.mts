/**
 * Self Healing session forwarder.
 *
 * Captured sessions from the browser POST here; this function forwards the
 * body verbatim to the Self Healing API. The Self Healing credential lives
 * only in Netlify site environment variables — never in the repo or bundle.
 */
export default async (req: Request): Promise<Response> => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const body = await req.text();
  if (new TextEncoder().encode(body).byteLength > 256 * 1024) {
    return Response.json(
      { error: "Capture exceeds Self Healing request limit" },
      { status: 413 },
    );
  }

  const upstream = await fetch(
    new URL("/api/v1/connection/sessions", process.env.SELF_HEALING_URL),
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SELF_HEALING_API_KEY}`,
        "Content-Type": "application/json",
      },
      body,
    },
  );

  return new Response(await upstream.text(), {
    status: upstream.status,
    headers: { "Content-Type": "application/json" },
  });
};

export const config = { path: "/api/self-healing/session" };
