// Serverless proxy so the Anthropic API key stays on the server and is never
// shipped to the browser. The client posts a standard Messages API body here;
// we add the key and forward it to Anthropic, returning the response verbatim.
export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const key = process.env.ANTHROPIC_API_KEY
  if (!key) {
    return json({ error: { message: 'ANTHROPIC_API_KEY is not set on the server.' } }, 500)
  }

  let body
  try {
    body = await req.text()
  } catch {
    return json({ error: { message: 'Invalid request body.' } }, 400)
  }

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body,
    })
    const text = await upstream.text()
    return new Response(text, {
      status: upstream.status,
      headers: { 'content-type': 'application/json' },
    })
  } catch (e) {
    return json({ error: { message: 'Upstream request failed: ' + (e?.message ?? e) } }, 502)
  }
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}
