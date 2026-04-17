// Vercel serverless function — proxies the Anthropic API so the key stays server-side.
// Set ANTHROPIC_API_KEY in Vercel project environment variables.

export const config = {
  runtime: 'edge',
  maxDuration: 300, // allow up to 5 minutes for searches
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

    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    const data = await upstream.text();

    return new Response(data, {
      status: upstream.status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err?.message || 'Unknown error proxying to Anthropic.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
