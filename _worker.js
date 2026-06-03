export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    if (url.pathname === '/api/generate' && request.method === 'POST') {
      const { prompt, ratio } = await request.json();
      const key = env.REPLICATE_API_KEY;
      if (!key) return new Response('{"error":"REPLICATE_API_KEY not set"}', { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });

      const r1 = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions', {
        method: 'POST', headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: { prompt, go_fast: true, num_outputs: 1, aspect_ratio: ratio || '1:1', output_format: 'webp' } })
      });
      const p = await r1.json();
      
      let r = p;
      for (let i = 0; i < 60 && r.status !== 'succeeded' && r.status !== 'failed'; i++) {
        await new Promise(x => setTimeout(x, 1000));
        const r2 = await fetch(`https://api.replicate.com/v1/predictions/${r.id}`, { headers: { 'Authorization': `Bearer ${key}` } });
        r = await r2.json();
      }
      
      const img = r.output?.[0] || r.output;
      return new Response(JSON.stringify(r.status === 'failed' ? { error: r.error } : { url: img }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }
      });
    }
    
    if (url.pathname === '/api/generate' && request.method === 'OPTIONS') {
      return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
    }

    return new Response('Not found', { status: 404 });
  }
}
