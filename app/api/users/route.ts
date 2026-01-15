import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'

// GET - Retrieve approved users for selection
export async function GET(_: NextRequest) {
  try {
    try {
      await connectDB()
    } catch (dbError: any) {
      console.error('Database connection error:', dbError)
      return NextResponse.json(
        {
          error: 'Database connection failed',
          message: dbError.message || 'Unable to connect to database. Please check your MongoDB connection string.',
          details: process.env.NODE_ENV === 'development' ? dbError.message : undefined,
        },
        { status: 503 }
      )
    }

    const users = await User.find({ isApproved: true })
      .select('name email role')
      .sort({ name: 1 })
      .lean()

    const data = users.map((user) => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    }))

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch users',
        message: error.message || 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}
