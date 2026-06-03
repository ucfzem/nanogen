export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const TOKEN = env.TOKEN

    const replicateUrl = 'https://api.replicate.com' + url.pathname + url.search

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      })
    }

    const res = await fetch(replicateUrl, {
      method: request.method,
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: request.method !== 'GET' ? await request.text() : undefined
    })

    return new Response(await res.text(), {
      status: res.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': res.headers.get('Content-Type') || 'application/json'
      }
    })
  }
}
