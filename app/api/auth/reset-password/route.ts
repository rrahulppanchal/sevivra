import { NextResponse } from 'next/server'
import crypto from 'crypto'
import connectDB from '@/lib/db'
import User from '@/models/User'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token, password } = body

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Reset token is required' },
        { status: 400 }
      )
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    await connectDB()

    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select('+password +passwordResetToken +passwordResetExpires')

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token. Please request a new password reset.' },
        { status: 400 }
      )
    }

    // Update password and clear reset fields
    user.password = password
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save()

    return NextResponse.json({
      message: 'Password reset successfully. You can now sign in with your new password.',
    })
  } catch (error: any) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    )
  }
}
