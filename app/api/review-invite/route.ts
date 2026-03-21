import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import User from "@/models/User"
import Project from "@/models/Project"
import Notification from "@/models/Notification"
import { getCurrentUser } from "@/lib/auth"
import { sendReviewInvitationEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const currentUser = await getCurrentUser()
    if (!currentUser?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { email, name, projectId } = body

    if (!email || typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      return NextResponse.json({ error: "A valid email is required." }, { status: 400 })
    }
    if (!projectId || typeof projectId !== "string") {
      return NextResponse.json({ error: "projectId is required." }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const reviewerName = typeof name === "string" ? name.trim() : ""

    // Look up project
    const project = await Project.findById(projectId).lean()
    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 })
    }

    // Check if sender is a project member
    const isMember = project.users?.some((uid: any) => uid.toString() === currentUser.id)
    if (!isMember) {
      return NextResponse.json({ error: "Only project members can send review requests." }, { status: 403 })
    }

    // Look up sender name
    const sender = await User.findById(currentUser.id).select("name").lean()
    const senderName = sender?.name || "A researcher"

    // Check if the reviewer is an existing user
    const existingUser = await User.findOne({ email: normalizedEmail }).select("_id name").lean()

    const projectUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/projects/${projectId}`
    const projectTitle = project.title || "Untitled project"

    // If existing user, create in-app notification
    if (existingUser) {
      // Check for duplicate pending review request
      const existing = await Notification.findOne({
        recipientId: existingUser._id,
        senderId: currentUser.id,
        type: "review_request",
        "metadata.projectId": projectId,
        status: { $in: ["unread", "read"] },
      })

      if (existing) {
        return NextResponse.json({ error: "A review request has already been sent to this user." }, { status: 409 })
      }

      await Notification.create({
        recipientId: existingUser._id,
        senderId: currentUser.id,
        type: "review_request",
        title: "Review request",
        message: `${senderName} invited you to review "${projectTitle}".`,
        status: "unread",
        metadata: { projectId, projectTitle },
      })
    }

    // Send email to both existing and non-existing users
    try {
      await sendReviewInvitationEmail(
        normalizedEmail,
        existingUser ? (existingUser as any).name : reviewerName,
        senderName,
        projectTitle,
        projectUrl,
        !!existingUser,
      )
    } catch (emailError) {
      console.error("Failed to send review invitation email:", emailError)
      return NextResponse.json(
        { error: "Failed to send invitation email. Please try again." },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      isExistingUser: !!existingUser,
      message: existingUser
        ? `Review request sent to ${(existingUser as any).name}.`
        : `Invitation email sent to ${normalizedEmail}.`,
    })
  } catch (error: any) {
    console.error("Review invite error:", error)
    return NextResponse.json(
      { error: "Failed to send review invitation." },
      { status: 500 },
    )
  }
}
