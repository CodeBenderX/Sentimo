import { NextResponse } from "next/server"

const FLASK_BACKEND_URL = "http://localhost:5000/api/journal"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Forward the request to Flask backend
    const response = await fetch(FLASK_BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error connecting to Flask backend:", error)
    return NextResponse.json(
      {
        error: "Failed to connect to Flask backend",
        success: false,
        fallbackResponse: "I'm sorry, I couldn't process your journal entry at the moment. Please try again later.",
      },
      { status: 500 },
    )
  }
}