import { NextRequest, NextResponse } from "next/server"
import { ZodError, z } from "zod"
import connectDB from "@/lib/db"
import ChatSession from "@/models/ChatSession"

const chatMessageSchema = z.object({
  type: z.enum(["user", "ai"]),
  content: z.string().trim().min(1),
  timestamp: z.string().optional(),
})

const timelineItemSchema = z.object({
  id: z.string().trim().min(1),
  text: z.string().trim().min(1),
  level: z.number().int().min(1).max(4),
  index: z.number().int().min(0),
})

const saveChatSchema = z.object({
  sessionId: z.string().optional(),
  manuscriptId: z.string().trim().min(1),
  manuscriptTitle: z.string().trim().optional(),
  model: z.string().trim().optional(),
  messages: z.array(chatMessageSchema).optional(),
  generatedContent: z.string().optional(),
  timeline: z.array(timelineItemSchema).optional(),
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
      validated = saveChatSchema.parse(body)
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

    const messages =
      validated.messages?.map((message) => ({
        type: message.type,
        content: message.content,
        timestamp: message.timestamp ? new Date(message.timestamp) : new Date(),
      })) ?? []

    const timeline = validated.timeline ?? []

    const payload = {
      manuscriptId: validated.manuscriptId,
      manuscriptTitle: validated.manuscriptTitle,
      model: validated.model,
      messages,
      generatedContent: validated.generatedContent,
      timeline,
    }

    if (validated.sessionId) {
      const updated = await ChatSession.findByIdAndUpdate(validated.sessionId, payload, {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      })

      return NextResponse.json(
        {
          success: true,
          data: {
            id: updated._id,
            updatedAt: updated.updatedAt,
          },
        },
        { status: 200 },
      )
    }

    const created = await ChatSession.create(payload)

    return NextResponse.json(
      {
        success: true,
        data: {
          id: created._id,
          createdAt: created.createdAt,
        },
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("Error saving chat session:", error)

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
        error: "Failed to save chat session",
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
    const sessionId = searchParams.get("sessionId")?.trim()

    if (!manuscriptId && !sessionId) {
      return NextResponse.json({ error: "manuscriptId or sessionId is required." }, { status: 400 })
    }

    const session = sessionId
      ? await ChatSession.findById(sessionId).select("-__v").lean()
      : await ChatSession.findOne({ manuscriptId })
          .sort({ updatedAt: -1 })
          .select("-__v")
          .lean()

    if (!session) {
      return NextResponse.json({ success: true, data: null }, { status: 200 })
    }

    return NextResponse.json({ success: true, data: session }, { status: 200 })
  } catch (error: any) {
    console.error("Error fetching chat session:", error)

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
        error: "Failed to fetch chat session",
        message: error.message || "An unexpected error occurred",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
