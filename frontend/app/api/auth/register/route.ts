export async function POST(request: Request) {
  try {
    const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8001'
    const body = await request.json()
    const resp = await fetch(`${BACKEND_API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const text = await resp.text()
    try {
      const json = JSON.parse(text)
      return Response.json(json, { status: resp.status })
    } catch {
      return Response.json({ error: text || 'Unexpected response' }, { status: resp.status })
    }
  } catch (e) {
    console.error('Register proxy error', e)
    return Response.json({ error: 'Register failed' }, { status: 500 })
  }
}


