export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // API proxy endpoint
    if (url.pathname === '/api/generate') {
      if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
      }

      const REPLICATE_API_KEY = env.REPLICATE_API_KEY;
      if (!REPLICATE_API_KEY) {
        return new Response(JSON.stringify({ error: 'REPLICATE_API_KEY not configured' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }

      try {
        const { prompt, ratio } = await request.json();

        // Start prediction
        const predRes = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${REPLICATE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input: { prompt, go_fast: true, num_outputs: 1, aspect_ratio: ratio || '1:1', output_format: 'webp' }
          })
        });

        if (!predRes.ok) {
          const errText = await predRes.text();
          return new Response(JSON.stringify({ error: 'Replicate API error: ' + errText }), {
            status: predRes.status,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }

        const prediction = await predRes.json();

        // Poll until complete
        let result = prediction;
        let attempts = 0;
        while (result.status !== 'succeeded' && result.status !== 'failed' && attempts < 60) {
          await new Promise(r => setTimeout(r, 1000));
          const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
            headers: { 'Authorization': `Bearer ${REPLICATE_API_KEY}` }
          });
          result = await pollRes.json();
          attempts++;
        }

        if (result.status === 'failed') {
          return new Response(JSON.stringify({ error: result.error || 'Generation failed' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }

        const imageUrl = result.output?.[0] || result.output;
        if (!imageUrl) {
          return new Response(JSON.stringify({ error: 'No image in response' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }

        return new Response(JSON.stringify({ url: imageUrl }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });

      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }

    // CORS preflight
    if (url.pathname === '/api/generate' && request.method === 'OPTIONS') {
      return new Response(null, {
        headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }
      });
    }

    // Serve static assets
    let path = url.pathname.replace(/^\/nanogen/, '');
    if (path === '' || path === '/') path = '/index.html';
    if (!path.includes('.')) path = path + '/index.html';

    const assetReq = new Request(new URL(path, url), request);
    const res = await env.ASSETS.fetch(assetReq);
    if (res.status === 200) return res;

    return new Response('Not Found', { status: 404 });
  }
}
