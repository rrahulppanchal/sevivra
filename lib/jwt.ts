import jwt from 'jsonwebtoken'
import { UserRole } from '@/models/User'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export interface JWTPayload {
  userId: string
  email: string
  role: UserRole
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  })
}

export function verifyToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    throw new Error('Invalid or expired token')
  }
}

export function getTokenFromRequest(request: Request | { cookies?: { get: (name: string) => { value: string } | undefined }, headers: Headers }): string | null {
  // Check Authorization header first
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  // Check cookies (for Next.js Request with cookies)
  if ('cookies' in request && request.cookies) {
    const token = request.cookies.get('token')
    if (token?.value) {
      return token.value
    }
  }
  
  return null
}

