export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      })
    }

    if (url.pathname === '/generate' && request.method === 'POST') {
      try {
        const { prompt, width, height } = await request.json()

        const res = await fetch(
          'https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell',
          {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + env.TOKEN,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              inputs: prompt,
              parameters: { width: width || 1024, height: height || 1024 }
            })
          }
        )

        const contentType = res.headers.get('content-type') || ''

        if (contentType.includes('image')) {
          const blob = await res.arrayBuffer()
          return new Response(blob, {
            status: 200,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': contentType
            }
          })
        }

        const text = await res.text()
        return new Response(text, {
          status: res.status,
          headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' }
        })
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' }
        })
      }
    }

    return new Response('Not found', { status: 404 })
  }
}
