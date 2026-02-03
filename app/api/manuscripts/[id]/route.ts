import { NextRequest, NextResponse } from "next/server"
import { ZodError } from "zod"
import connectDB from "@/lib/db"
import Manuscript from "@/models/Manuscript"
import { manuscriptUpdateSchema } from "@/lib/validations/manuscript"

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

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id: manuscriptId } = await params
    if (!manuscriptId) {
      return NextResponse.json({ error: "Manuscript id is required." }, { status: 400 })
    }

    const body = await request.json()
    let validated
    try {
      validated = manuscriptUpdateSchema.parse(body)
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error)
      }
      throw error
    }

    if (!validated.title && typeof validated.contentHtml !== "string") {
      return NextResponse.json({ error: "No updates provided." }, { status: 400 })
    }

    const updatePayload: Record<string, any> = {}
    if (validated.title) updatePayload.title = validated.title
    if (typeof validated.contentHtml === "string") updatePayload.contentHtml = validated.contentHtml

    const updated = await Manuscript.findByIdAndUpdate(manuscriptId, updatePayload, { new: true })
      .select("-__v")
      .lean()

    if (!updated) {
      return NextResponse.json({ error: "Manuscript not found." }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: updated }, { status: 200 })
  } catch (error: any) {
    console.error("Error updating manuscript:", error)

    if (error instanceof ZodError) {
      return handleZodError(error)
    }

    return NextResponse.json(
      {
        error: "Failed to update manuscript",
        message: error.message || "An unexpected error occurred",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
