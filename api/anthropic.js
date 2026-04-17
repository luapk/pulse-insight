// Streaming Edge Function — proxies the Anthropic API with streaming enabled.
// Streaming keeps the connection alive through token-by-token output, bypassing
// Vercel's idle timeout limits. Works on Vercel Hobby plan.
//
// The browser receives a live SSE stream it can parse progressively.

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: 'Server misconfigured: ANTHROPIC_API_KEY environment variable is missing.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await req.json();

    // Force streaming on — this is what keeps the connection alive
    const streamingBody = { ...body, stream: true };

    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(streamingBody),
    });

    // If upstream errored, forward the error response as-is
    if (!upstream.ok) {
      const errText = await upstream.text();
      return new Response(errText, {
        status: upstream.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Stream the SSE response straight to the browser
    return new Response(upstream.body, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err?.message || 'Unknown error proxying to Anthropic.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
