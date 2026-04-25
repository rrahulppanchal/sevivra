import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import connectDB from "@/lib/db"
import Notification from "@/models/Notification"
import Project from "@/models/Project"
import { getCurrentUser } from "@/lib/auth"

const validateObjectId = (id: string) => mongoose.Types.ObjectId.isValid(id)

export async function PATCH(request: NextRequest, context: { params: Promise<{ id?: string }> | { id?: string } }) {
  try {
    const params = await context.params
    const notificationId = params?.id
    if (!notificationId || !validateObjectId(notificationId)) {
      return NextResponse.json({ error: "Invalid notification id" }, { status: 400 })
    }

    await connectDB()
    const currentUser = await getCurrentUser()
    if (!currentUser?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const status = typeof body?.status === "string" ? body.status.trim() : ""
    if (!status) {
      return NextResponse.json({ error: "status is required." }, { status: 400 })
    }

    const notification = await Notification.findById(notificationId)
    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }
    if (notification.recipientId.toString() !== currentUser.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if ((notification.type === "collaboration_request" || notification.type === "review_request") && status === "accepted") {
      const projectId = notification.metadata?.projectId
      if (projectId && validateObjectId(projectId)) {
        await Project.findByIdAndUpdate(projectId, { $addToSet: { users: currentUser.id } })
      }
      if (notification.senderId) {
        const acceptLabel = notification.type === "review_request" ? "Review request" : "Collaboration request"
        await Notification.create({
          recipientId: notification.senderId,
          senderId: currentUser.id,
          type: "info",
          title: `${acceptLabel} accepted`,
          message: `${currentUser.name || "A user"} accepted your ${notification.type === "review_request" ? "review" : "collaboration"} request for "${notification.metadata?.projectTitle || "a project"}".`,
          status: "unread",
          metadata: {
            projectId: projectId || undefined,
            projectTitle: notification.metadata?.projectTitle,
          },
        })
      }
    }

    notification.status = status
    await notification.save()

    return NextResponse.json({ success: true, data: notification }, { status: 200 })
  } catch (error: any) {
    console.error("Error updating notification:", error)
    return NextResponse.json(
      { error: "Failed to update notification", message: error.message || "An unexpected error occurred" },
      { status: 500 },
    )
  }
}

export async function DELETE(_: NextRequest, context: { params: Promise<{ id?: string }> | { id?: string } }) {
  try {
    const params = await context.params
    const notificationId = params?.id
    if (!notificationId || !validateObjectId(notificationId)) {
      return NextResponse.json({ error: "Invalid notification id" }, { status: 400 })
    }

    await connectDB()
    const currentUser = await getCurrentUser()
    if (!currentUser?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const notification = await Notification.findById(notificationId)
    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }
    if (notification.senderId?.toString() !== currentUser.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await Notification.findByIdAndDelete(notificationId)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error("Error deleting notification:", error)
    return NextResponse.json(
      { error: "Failed to delete notification", message: error.message || "An unexpected error occurred" },
      { status: 500 },
    )
  }
}
