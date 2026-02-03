import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import PublishedDocument from "@/models/PublishedDocument"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    try {
      await connectDB()
    } catch (dbError: any) {
      console.error("Database connection error:", dbError)
      return NextResponse.json(
        {
          error: "Database connection failed",
          message: dbError.message || "Unable to connect to database. Please check your MongoDB connection string.",
          details: process.env.NODE_ENV === "development" ? dbError.message : undefined,
        },
        { status: 503 },
      )
    }

    const document = await PublishedDocument.findById(id).select("-__v").lean()
    if (!document) {
      return NextResponse.json({ error: "Published document not found." }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: document }, { status: 200 })
  } catch (error: any) {
    console.error("Error fetching published document:", error)

    if (error.name === "MongoNetworkError" || error.message?.includes("SSL") || error.message?.includes("TLS")) {
      return NextResponse.json(
        {
          error: "Database connection error",
          message: "Unable to connect to the database. Please check your MongoDB connection settings.",
          details: process.env.NODE_ENV === "development" ? error.message : undefined,
        },
        { status: 503 },
      )
    }

    return NextResponse.json(
      {
        error: "Failed to fetch published document",
        message: error.message || "An unexpected error occurred",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
