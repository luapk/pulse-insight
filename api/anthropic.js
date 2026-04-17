// Vercel serverless function (Node runtime) — proxies the Anthropic API so the key stays server-side.
// Set ANTHROPIC_API_KEY in Vercel project environment variables.
//
// Timeout notes:
// - Vercel Hobby plan: 60s max (configured below)
// - Vercel Pro plan: up to 300s — change maxDuration to 300 if you upgrade
//
// If you still hit 504s on Hobby:
// 1. Upgrade to Vercel Pro ($20/month) and bump maxDuration to 300, OR
// 2. Ask for a streaming implementation (keeps the connection alive past timeouts)

export const config = {
  maxDuration: 60,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'Server misconfigured: ANTHROPIC_API_KEY environment variable is missing.',
    });
  }

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(req.body),
    });

    const data = await upstream.text();
    res.status(upstream.status);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    return res.send(data);
  } catch (err) {
    return res.status(500).json({
      error: err?.message || 'Unknown error proxying to Anthropic.',
    });
  }
}
