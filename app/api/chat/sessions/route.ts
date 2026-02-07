import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import ChatSession from "@/models/ChatSession"

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const manuscriptId = searchParams.get("manuscriptId")?.trim()

    if (!manuscriptId) {
      return NextResponse.json({ error: "manuscriptId is required." }, { status: 400 })
    }

    const sessions = await ChatSession.find({ manuscriptId })
      .sort({ updatedAt: -1 })
      .select("messages updatedAt createdAt")
      .lean()

    return NextResponse.json({ success: true, data: sessions }, { status: 200 })
  } catch (error: any) {
    console.error("Error fetching chat sessions:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch chat sessions",
        message: error.message || "An unexpected error occurred",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
