// Create new session
export async function POST() {
  try {
    const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8044'
    
    const response = await fetch(`${ML_API_URL}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    })

    if (!response.ok) {
      throw new Error(`ML API responded with ${response.status}`)
    }

    const data = await response.json()
    return Response.json(data)
    
  } catch (error) {
    console.error('Error creating session:', error)
    return Response.json(
      { error: 'Failed to create session' },
      { status: 500 }
    )
  }
}

// Get existing session with messages
export async function GET(request: Request) {
  try {
    const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8044'
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    
    if (!sessionId) {
      return Response.json(
        { error: 'sessionId is required' },
        { status: 400 }
      )
    }

    console.log(`Loading session: ${sessionId}`)

    const response = await fetch(`${ML_API_URL}/sessions/${sessionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      if (response.status === 404) {
        return Response.json(
          { error: 'Session not found' },
          { status: 404 }
        )
      }
      throw new Error(`ML API responded with ${response.status}`)
    }

    const data = await response.json()
    console.log(`Session loaded: ${data.messages?.length || 0} messages`)
    return Response.json(data)
    
  } catch (error) {
    console.error('Error loading session:', error)
    return Response.json(
      { error: 'Failed to load session' },
      { status: 500 }
    )
  }
}
