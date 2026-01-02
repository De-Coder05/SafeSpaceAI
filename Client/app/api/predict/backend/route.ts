import { NextRequest, NextResponse } from "next/server"

// Proxy route that forwards multipart requests to the FastAPI backend
// This keeps the browser talking only to the Next.js origin (no CORS issues)

const BACKEND_URL = "http://localhost:8001/predict"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const backendResponse = await fetch(BACKEND_URL, {
      method: "POST",
      body: formData,
    })

    const data = await backendResponse.json().catch(() => ({}))

    return NextResponse.json(data, { status: backendResponse.status })
  } catch (error) {
    console.error("❌ Error proxying to backend /predict:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Proxy Error",
        message: "Failed to reach backend /predict endpoint",
      },
      { status: 500 },
    )
  }
}



