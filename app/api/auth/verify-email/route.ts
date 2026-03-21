import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import connectDB from '@/lib/db'
import User from '@/models/User'

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    await connectDB()

    // Hash the token to match stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    // Find user with matching token that hasn't expired
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: new Date() },
    }).select('+emailVerificationToken +emailVerificationExpires')

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired verification link' },
        { status: 400 }
      )
    }

    // Mark email as verified and clear token fields
    user.isEmailVerified = true
    user.emailVerificationToken = undefined
    user.emailVerificationExpires = undefined
    await user.save()

    return NextResponse.json({
      message: 'Email verified successfully. You can now sign in.',
    })
  } catch (error: any) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
