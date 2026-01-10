import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import { getTokenFromRequest, verifyToken } from '@/lib/jwt'

export async function GET(request: NextRequest) {
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
        { error: 'Only super admin can view pending users' },
        { status: 403 }
      )
    }

    // Get all pending users
    const pendingUsers = await User.find({ isApproved: false, role: { $ne: 'super_admin' } })
      .select('-password')
      .sort({ createdAt: -1 })

    const users = pendingUsers.map((user) => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      institution: user.institution,
      createdAt: user.createdAt,
    }))

    return NextResponse.json({ users })
  } catch (error: any) {
    console.error('Get pending users error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

