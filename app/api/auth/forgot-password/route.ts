import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.trim().toLowerCase()

    await connectDB()

    const user = await User.findOne({ email: normalizedEmail })

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        message: 'If an account with that email exists, we have sent a password reset link.',
      })
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken()
    await user.save({ validateBeforeSave: false })

    // Send email
    try {
      await sendPasswordResetEmail(user.email, resetToken, user.name)
    } catch (emailError) {
      // Clear the token if email fails
      user.passwordResetToken = undefined
      user.passwordResetExpires = undefined
      await user.save({ validateBeforeSave: false })

      console.error('Failed to send password reset email:', emailError)
      return NextResponse.json(
        { error: 'Failed to send reset email. Please try again later.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'If an account with that email exists, we have sent a password reset link.',
    })
  } catch (error: any) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    )
  }
}
