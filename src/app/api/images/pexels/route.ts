import { type NextRequest, NextResponse } from "next/server"

const PEXELS_API_KEY = process.env.PEXELS_API_KEY

export async function GET(request: NextRequest) {
  try {
    if (!PEXELS_API_KEY) {
      return NextResponse.json(
        { error: "Pexels API key not configured" },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")
  const page = searchParams.get("page") || "1"
  const perPage = searchParams.get("per_page") || "10"

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
  }

  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&orientation=landscape`

    const response = await fetch(url, {
      headers: {
        Authorization: PEXELS_API_KEY,
        Accept: "application/json",
        "User-Agent": "GoldenHourCalculator/1.0",
      },
    })

    if (!response.ok) {
      if (response.status === 429) {
        console.warn("Pexels API rate limit exceeded")
        return NextResponse.json({ photos: [], total_results: 0, page: 1, per_page: 10 }, { status: 200 })
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // Check if response is actually JSON
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      console.warn("Pexels API returned non-JSON response")
      return NextResponse.json({ photos: [], total_results: 0, page: 1, per_page: 10 }, { status: 200 })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching from Pexels:", error)
    return NextResponse.json({ photos: [], total_results: 0, page: 1, per_page: 10 }, { status: 200 })
  }
  } catch (error) {
    console.error("Error in Pexels API route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}