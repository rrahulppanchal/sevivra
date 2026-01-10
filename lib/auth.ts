import { cookies } from 'next/headers'
import { verifyToken } from './jwt'
import connectDB from './db'
import User from '@/models/User'

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      return null
    }

    const payload = verifyToken(token)
    await connectDB()
    
    const user = await User.findById(payload.userId).select('-password')
    
    if (!user) {
      return null
    }

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      institution: user.institution,
      isApproved: user.isApproved,
    }
  } catch (error) {
    return null
  }
}

export function requireAuth() {
  // This will be used in server components
  // If user is not authenticated, middleware will redirect
}

export function requireRole(allowedRoles: string[]) {
  // This will be used in server components
  // Check role in the component itself
}

