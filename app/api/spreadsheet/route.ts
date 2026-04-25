import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import SpreadsheetData from "@/models/SpreadsheetData"
import Project from "@/models/Project"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("projectId")?.trim()

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required." }, { status: 400 })
    }

    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    let spreadsheet = await SpreadsheetData.findOne({ projectId }).select("-__v").lean()

    // Auto-create empty spreadsheet if none exists
    if (!spreadsheet) {
      const columns = Array.from({ length: 10 }, (_, i) => String.fromCharCode(65 + i))
      const emptyRows: Record<string, string>[] = []
      for (let i = 0; i < 20; i++) {
        const row: Record<string, string> = {}
        columns.forEach((col) => { row[col] = "" })
        emptyRows.push(row)
      }

      const created = await SpreadsheetData.create({
        projectId,
        data: emptyRows,
        columns,
        createdBy: currentUser.id,
      })

      spreadsheet = created.toObject()
    }

    return NextResponse.json({ success: true, data: spreadsheet }, { status: 200 })
  } catch (error: any) {
    console.error("Error fetching spreadsheet:", error)
    return NextResponse.json(
      { error: "Failed to fetch spreadsheet data", message: error.message },
      { status: 500 },
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB()
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    const body = await request.json()
    const projectId = typeof body?.projectId === "string" ? body.projectId.trim() : ""
    const data = Array.isArray(body?.data) ? body.data : undefined
    const columns = Array.isArray(body?.columns) ? body.columns : undefined

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required." }, { status: 400 })
    }

    // Verify user is the project owner
    const project = await Project.findById(projectId).lean()
    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 })
    }

    const projectUsers = Array.isArray(project.users) ? project.users.map((u: any) => u.toString()) : []
    if (projectUsers[0] !== currentUser.id) {
      return NextResponse.json({ error: "Only the project owner can modify spreadsheet data." }, { status: 403 })
    }

    const updateFields: Record<string, any> = {}
    if (data !== undefined) updateFields.data = data
    if (columns !== undefined) updateFields.columns = columns

    const spreadsheet = await SpreadsheetData.findOneAndUpdate(
      { projectId },
      { $set: updateFields },
      { new: true, upsert: true },
    ).select("-__v").lean()

    return NextResponse.json({ success: true, data: spreadsheet }, { status: 200 })
  } catch (error: any) {
    console.error("Error updating spreadsheet:", error)
    return NextResponse.json(
      { error: "Failed to update spreadsheet data", message: error.message },
      { status: 500 },
    )
  }
}
