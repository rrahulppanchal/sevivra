import { NextRequest, NextResponse } from "next/server"
import { ZodError, z } from "zod"
import connectDB from "@/lib/db"
import ManuscriptComment from "@/models/ManuscriptComment"

const createCommentSchema = z.object({
  manuscriptId: z.string().trim().min(1),
  author: z.string().trim().min(1),
  content: z.string().trim().min(1),
  avatar: z.string().trim().optional(),
})

export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json()

    let validated
    try {
      validated = createCommentSchema.parse(body)
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            error: "Validation error",
            details: error.errors.map((err) => ({
              path: err.path.join("."),
              message: err.message,
            })),
          },
          { status: 400 },
        )
      }
      throw error
    }

    const created = await ManuscriptComment.create({
      manuscriptId: validated.manuscriptId,
      author: validated.author,
      content: validated.content,
      avatar: validated.avatar,
    })

    return NextResponse.json(
      {
        success: true,
        data: created,
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("Error creating comment:", error)

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: error.errors.map((err) => ({
            path: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 },
      )
    }

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json({ error: "Validation error", details: errors }, { status: 400 })
    }

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
        error: "Failed to create comment",
        message: error.message || "An unexpected error occurred",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
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

    const { searchParams } = new URL(request.url)
    const manuscriptId = searchParams.get("manuscriptId")?.trim()

    if (!manuscriptId) {
      return NextResponse.json({ error: "manuscriptId is required." }, { status: 400 })
    }

    const comments = await ManuscriptComment.find({ manuscriptId })
      .sort({ createdAt: -1 })
      .select("-__v")
      .lean()

    return NextResponse.json({ success: true, data: comments }, { status: 200 })
  } catch (error: any) {
    console.error("Error fetching comments:", error)

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
        error: "Failed to fetch comments",
        message: error.message || "An unexpected error occurred",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
