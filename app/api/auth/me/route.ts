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

    // Get user from database
    const user = await User.findById(payload.userId)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Return user data (without password)
    const userData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      institution: user.institution,
      isApproved: user.isApproved,
    }

    return NextResponse.json({ user: userData })
  } catch (error: any) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

