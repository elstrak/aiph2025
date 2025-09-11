export async function GET(request: Request) {
  const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8001'
  const auth = request.headers.get('authorization') || ''
  const resp = await fetch(`${BACKEND_API_URL}/profile/me`, { headers: auth ? { Authorization: auth } : undefined })
  const text = await resp.text()
  try { return Response.json(JSON.parse(text), { status: resp.status }) } catch { return Response.json({ error: text }, { status: resp.status }) }
}

export async function PUT(request: Request) {
  const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:8001'
  const auth = request.headers.get('authorization') || ''
  const body = await request.json()
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (auth) headers['Authorization'] = auth
  const resp = await fetch(`${BACKEND_API_URL}/profile/me`, { method: 'PUT', headers, body: JSON.stringify(body) })
  const text = await resp.text()
  try { return Response.json(JSON.parse(text), { status: resp.status }) } catch { return Response.json({ error: text }, { status: resp.status }) }
}


