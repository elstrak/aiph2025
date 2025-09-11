export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8044'
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 })
    }
    if (file.type !== 'application/pdf') {
      return Response.json({ error: 'Only PDF is allowed' }, { status: 400 })
    }

    const forward = new FormData()
    forward.append('file', file, file.name)

    const resp = await fetch(`${ML_API_URL}/profile/upload`, {
      method: 'POST',
      body: forward as unknown as BodyInit,
      // Let fetch set headers for multipart automatically
    })

    const text = await resp.text()
    try {
      const json = JSON.parse(text)
      return Response.json(json, { status: resp.status })
    } catch {
      return Response.json({ error: text || 'Unexpected response' }, { status: resp.status })
    }
  } catch (e) {
    console.error('Upload error', e)
    return Response.json({ error: 'Upload failed' }, { status: 500 })
  }
}


