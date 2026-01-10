import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import { getTokenFromRequest, verifyToken } from '@/lib/jwt'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    // Check cookie first, then Authorization header
    const token = request.cookies.get('token')?.value || getTokenFromRequest(request)

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify token
    let payload
    try {
      payload = verifyToken(token)
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Check if user is super admin
    if (payload.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Only super admin can approve users' },
        { status: 403 }
      )
    }

    const { userId, approved } = await request.json()

    if (!userId || typeof approved !== 'boolean') {
      return NextResponse.json(
        { error: 'userId and approved (boolean) are required' },
        { status: 400 }
      )
    }

    // Get the user to approve
    const userToApprove = await User.findById(userId)

    if (!userToApprove) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Don't allow approving super admin
    if (userToApprove.role === 'super_admin') {
      return NextResponse.json(
        { error: 'Cannot modify super admin approval status' },
        { status: 403 }
      )
    }

    // Update approval status
    userToApprove.isApproved = approved
    if (approved) {
      userToApprove.approvedAt = new Date()
      userToApprove.approvedBy = payload.userId as any
    } else {
      userToApprove.approvedAt = undefined
      userToApprove.approvedBy = undefined
    }

    await userToApprove.save()

    const userData = {
      id: userToApprove._id.toString(),
      name: userToApprove.name,
      email: userToApprove.email,
      role: userToApprove.role,
      institution: userToApprove.institution,
      isApproved: userToApprove.isApproved,
    }

    return NextResponse.json({
      message: approved ? 'User approved successfully' : 'User approval revoked',
      user: userData,
    })
  } catch (error: any) {
    console.error('Approve user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

