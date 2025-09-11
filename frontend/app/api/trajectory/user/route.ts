// Get user trajectories
export async function GET(request: Request) {
  try {
    const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8044'
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return Response.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    console.log(`Loading trajectories for user: ${userId}`)

    const response = await fetch(`${ML_API_URL}/trajectory/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      if (response.status === 404) {
        return Response.json([]) // Return empty array if no trajectories found
      }
      throw new Error(`ML API responded with ${response.status}`)
    }

    const data = await response.json()
    console.log(`Loaded ${data.length} trajectories for user ${userId}`)
    return Response.json(data)
    
  } catch (error) {
    console.error('Error loading user trajectories:', error)
    return Response.json(
      { error: 'Failed to load trajectories' },
      { status: 500 }
    )
  }
}
