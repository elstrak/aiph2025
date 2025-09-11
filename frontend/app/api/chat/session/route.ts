export async function POST(request: Request) {
  try {
    const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8044'
    const { sessionId, text } = await request.json()
    const authorization = request.headers.get('authorization')
    
    console.log('Chat API called:', {
      sessionId: sessionId,
      text: text,
      ML_API_URL: ML_API_URL
    })
    
    if (!sessionId || !text) {
      console.log('Missing sessionId or text')
      return Response.json(
        { error: 'sessionId and text are required' },
        { status: 400 }
      )
    }

    console.log(`Making request to: ${ML_API_URL}/chat/${sessionId}`)
    
    const response = await fetch(`${ML_API_URL}/chat/${sessionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authorization && { 'Authorization': authorization })
      },
      body: JSON.stringify({ text })
    })

    console.log('ML API response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.log('ML API error response:', errorText)
      throw new Error(`ML API responded with ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    console.log('ML API response data:', data)
    return Response.json(data)
    
  } catch (error) {
    console.error('Error in chat API route:', error)
    return Response.json(
      { error: 'Failed to process chat message', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}