import { NextRequest, NextResponse } from "next/server"
import { ZodError } from "zod"
import connectDB from "@/lib/db"
import Manuscript from "@/models/Manuscript"
import { manuscriptCreateSchema } from "@/lib/validations/manuscript"
import { getCurrentUser } from "@/lib/auth"

const handleZodError = (error: ZodError) =>
  NextResponse.json(
    {
      error: "Validation error",
      details: error.errors.map((err) => ({
        path: err.path.join("."),
        message: err.message,
      })),
    },
    { status: 400 },
  )

const buildDefaultContent = (title: string) => {
  const safeTitle = title
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
  return `<h1>${safeTitle}</h1><p></p>`
}

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("projectId")?.trim()

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required." }, { status: 400 })
    }

    const manuscripts = await Manuscript.find({ projectId }).sort({ createdAt: 1 }).select("-__v").lean()

    return NextResponse.json({ success: true, data: manuscripts }, { status: 200 })
  } catch (error: any) {
    console.error("Error fetching manuscripts:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch manuscripts",
        message: error.message || "An unexpected error occurred",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()

    let validated
    try {
      validated = manuscriptCreateSchema.parse(body)
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error)
      }
      throw error
    }

    const currentUser = await getCurrentUser()
    const contentHtml = validated.contentHtml || buildDefaultContent(validated.title)

    const manuscript = await Manuscript.create({
      projectId: validated.projectId,
      title: validated.title,
      contentHtml,
      createdBy: currentUser?.id,
    })

    return NextResponse.json(
      {
        success: true,
        data: manuscript,
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("Error creating manuscript:", error)

    if (error instanceof ZodError) {
      return handleZodError(error)
    }

    return NextResponse.json(
      {
        error: "Failed to create manuscript",
        message: error.message || "An unexpected error occurred",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
