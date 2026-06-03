export default {
  async fetch(request) {
    const url = new URL(request.url)
    const REPLICATE_KEY = TOKEN

    if (url.pathname === '/predict' && request.method === 'POST') {
      const body = await request.json()

      const res = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${REPLICATE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      return new Response(await res.text(), {
        status: res.status,
        headers: { 'Access-Control-Allow-Origin': '*' }
      })
    }

    if (url.pathname.startsWith('/predictions/') && request.method === 'GET') {
      const id = url.pathname.split('/')[2]

      const res = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
        headers: { 'Authorization': `Bearer ${REPLICATE_KEY}` }
      })

      return new Response(await res.text(), {
        status: res.status,
        headers: { 'Access-Control-Allow-Origin': '*' }
      })
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      })
    }

    return new Response('Not found', { status: 404 })
  }
}
