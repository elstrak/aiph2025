export async function POST(request: Request) {
  try {
    const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8001'
    const form = await request.formData()
    const resp = await fetch(`${BACKEND_API_URL}/auth/login`, {
      method: 'POST',
      body: form as unknown as BodyInit,
    })
    const text = await resp.text()
    try {
      const json = JSON.parse(text)
      return Response.json(json, { status: resp.status })
    } catch {
      return Response.json({ error: text || 'Unexpected response' }, { status: resp.status })
    }
  } catch (e) {
    console.error('Login proxy error', e)
    return Response.json({ error: 'Login failed' }, { status: 500 })
  }
}


