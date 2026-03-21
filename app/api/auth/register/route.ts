import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import type { UserRole } from '@/models/User'
import { sendVerificationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { name, email, password, institution } = await request.json()

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Default role is 'user' for all new registrations
    const userRole: UserRole = 'user'

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Create new user (email not verified)
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password,
      role: userRole,
      institution: institution || undefined,
      isEmailVerified: false,
    })

    // Generate verification token and save
    const verificationToken = newUser.generateVerificationToken()
    await newUser.save()

    // Send verification email
    try {
      await sendVerificationEmail(newUser.email, verificationToken, newUser.name)
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
    }

    // Return user data (without password)
    const userData = {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      institution: newUser.institution,
      isEmailVerified: newUser.isEmailVerified,
    }

    return NextResponse.json(
      {
        message: 'Registration successful. Please check your email to verify your account.',
        user: userData,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Registration error:', error)

    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

