import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Notification from "@/models/Notification"
import Project from "@/models/Project"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const currentUser = await getCurrentUser()
    if (!currentUser?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")?.trim()
    const sent = searchParams.get("sent") === "true"
    const projectId = searchParams.get("projectId")?.trim()
    const type = searchParams.get("type")?.trim()

    const filter: Record<string, any> = sent
      ? { senderId: currentUser.id }
      : { recipientId: currentUser.id }
    if (status) {
      filter.status = status
    }
    if (type) {
      filter.type = type
    }
    if (projectId) {
      filter["metadata.projectId"] = projectId
    }

    let query = Notification.find(filter).sort({ createdAt: -1 }).select("-__v")
    if (sent) {
      query = query.populate("recipientId", "name email")
    }
    const notifications = await query.lean()

    return NextResponse.json({ success: true, data: notifications }, { status: 200 })
  } catch (error: any) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch notifications",
        message: error.message || "An unexpected error occurred",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const currentUser = await getCurrentUser()
    if (!currentUser?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const recipientId = typeof body?.recipientId === "string" ? body.recipientId.trim() : ""
    const type = typeof body?.type === "string" ? body.type.trim() : ""
    const title = typeof body?.title === "string" ? body.title.trim() : ""
    const message = typeof body?.message === "string" ? body.message.trim() : ""
    const metadata = typeof body?.metadata === "object" ? body.metadata : undefined

    if (!recipientId || !type || !title || !message) {
      return NextResponse.json({ error: "recipientId, type, title, and message are required." }, { status: 400 })
    }

    if (type === "collaboration_request") {
      const projectId = typeof metadata?.projectId === "string" ? metadata.projectId : ""
      if (!projectId) {
        return NextResponse.json({ error: "projectId is required for collaboration requests." }, { status: 400 })
      }
      const project = await Project.findById(projectId).select("users").lean()
      const ownerId = project?.users?.[0]?.toString()
      if (!ownerId || ownerId !== currentUser.id) {
        return NextResponse.json({ error: "Only the project owner can send requests." }, { status: 403 })
      }
    }

    const notification = await Notification.create({
      recipientId,
      senderId: currentUser.id,
      type,
      title,
      message,
      status: "unread",
      metadata,
    })

    return NextResponse.json({ success: true, data: notification }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating notification:", error)
    return NextResponse.json(
      {
        error: "Failed to create notification",
        message: error.message || "An unexpected error occurred",
      },
      { status: 500 },
    )
  }
}
