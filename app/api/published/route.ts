import { NextRequest, NextResponse } from "next/server"
import { ZodError, z } from "zod"
import connectDB from "@/lib/db"
import PublishedDocument from "@/models/PublishedDocument"

const publishSchema = z.object({
  projectId: z.string().trim().min(1),
  manuscriptId: z.string().trim().optional(),
  title: z.string().trim().optional(),
  contentHtml: z.string().trim().min(1),
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
      validated = publishSchema.parse(body)
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

    const created = await PublishedDocument.create({
      projectId: validated.projectId,
      manuscriptId: validated.manuscriptId,
      title: validated.title,
      contentHtml: validated.contentHtml,
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          id: created._id,
          projectId: created.projectId,
        },
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("Error publishing document:", error)

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
        error: "Failed to publish document",
        message: error.message || "An unexpected error occurred",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
