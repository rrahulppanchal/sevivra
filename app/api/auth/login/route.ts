import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import { generateToken } from '@/lib/jwt'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user and include password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password')

    if (!user) {
      console.error(`Login failed: User not found for email: ${email.toLowerCase()}`)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check if user is approved (super admin is always approved)
    if (!user.isApproved && user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Your account is pending approval from the administrator' },
        { status: 403 }
      )
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password)

    if (!isPasswordValid) {
      console.error(`Login failed: Invalid password for user: ${user.email}`)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    })

    // Return user data (without password)
    const userData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      institution: user.institution,
      isApproved: user.isApproved,
    }

    const response = NextResponse.json({
      message: 'Login successful',
      user: userData,
      token,
    })

    // Set HTTP-only cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

