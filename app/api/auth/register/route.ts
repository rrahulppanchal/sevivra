import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import { UserRole } from '@/models/User'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { name, email, password, institution, role } = await request.json()

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

    // Validate role
    const validRoles: UserRole[] = ['author', 'reviewer', 'editor']
    const userRole: UserRole = validRoles.includes(role) ? role : 'author'

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Create new user (pending approval)
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password,
      role: userRole,
      institution: institution || undefined,
      isApproved: false,
    })

    await newUser.save()

    // Return user data (without password)
    const userData = {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      institution: newUser.institution,
      isApproved: newUser.isApproved,
    }

    return NextResponse.json(
      {
        message: 'Registration successful. Your account is pending approval from the administrator.',
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

