import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import { getTokenFromRequest, verifyToken } from '@/lib/jwt'

export async function PATCH(request: NextRequest) {
  try {
    await connectDB()

    const token = request.cookies.get('token')?.value || getTokenFromRequest(request)

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let payload
    try {
      payload = verifyToken(token)
    } catch {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    const body = await request.json()

    // Only allow updating specific profile fields
    const allowedFields = ['name', 'institution', 'bio', 'degrees', 'keywords', 'links']
    const updates: Record<string, unknown> = {}

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field]
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    // Validate name if provided
    if (updates.name !== undefined) {
      const name = String(updates.name).trim()
      if (name.length < 2 || name.length > 100) {
        return NextResponse.json({ error: 'Name must be between 2 and 100 characters' }, { status: 400 })
      }
      updates.name = name
    }

    // Validate keywords
    if (updates.keywords !== undefined) {
      if (!Array.isArray(updates.keywords)) {
        return NextResponse.json({ error: 'Keywords must be an array' }, { status: 400 })
      }
      updates.keywords = (updates.keywords as string[]).filter((k: string) => typeof k === 'string' && k.trim()).map((k: string) => k.trim()).slice(0, 20)
    }

    // Validate links
    if (updates.links !== undefined) {
      if (!Array.isArray(updates.links)) {
        return NextResponse.json({ error: 'Links must be an array' }, { status: 400 })
      }
      updates.links = (updates.links as Array<{ label: string; url: string }>).filter((l) => l.label && l.url).slice(0, 10)
    }

    const user = await User.findByIdAndUpdate(
      payload.userId,
      { $set: updates },
      { new: true, runValidators: true }
    )

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      institution: user.institution,
      bio: user.bio || '',
      degrees: user.degrees || '',
      keywords: user.keywords || [],
      links: user.links || [],
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
    }

    return NextResponse.json({ user: userData })
  } catch (error: unknown) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
