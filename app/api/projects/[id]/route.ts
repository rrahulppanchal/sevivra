import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import mongoose from 'mongoose'
import connectDB from '@/lib/db'
import Project from '@/models/Project'
import { projectUpdateSchema } from '@/lib/validations/project'
import { getCurrentUser } from '@/lib/auth'

const handleDbConnectionError = (dbError: any) => {
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

const handleZodError = (error: ZodError) =>
  NextResponse.json(
    {
      error: 'Validation error',
      details: error.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
      })),
    },
    { status: 400 }
  )

const validateObjectId = (id: string) => mongoose.Types.ObjectId.isValid(id)

// GET - Retrieve a single project
export async function GET(_: NextRequest, context: { params: Promise<{ id?: string }> | { id?: string } }) {
  try {
    const params = await context.params
    const projectId = params?.id

    if (!projectId || !validateObjectId(projectId)) {
      return NextResponse.json({ error: 'Invalid project id' }, { status: 400 })
    }

    try {
      await connectDB()
    } catch (dbError: any) {
      return handleDbConnectionError(dbError)
    }

    const project = await Project.findById(projectId).select('-__v').lean()

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: project }, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project', message: error.message || 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

// PATCH - Update a project
export async function PATCH(request: NextRequest, context: { params: Promise<{ id?: string }> | { id?: string } }) {
  try {
    const params = await context.params
    const projectId = params?.id

    if (!projectId || !validateObjectId(projectId)) {
      return NextResponse.json({ error: 'Invalid project id' }, { status: 400 })
    }

    try {
      await connectDB()
    } catch (dbError: any) {
      return handleDbConnectionError(dbError)
    }

    const currentUser = await getCurrentUser()
    if (!currentUser?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    let validatedData
    try {
      validatedData = projectUpdateSchema.parse(body)
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error)
      }
      throw error
    }

    if (validatedData.users && !validatedData.users.includes(currentUser.id)) {
      return NextResponse.json(
        { error: 'Project owner cannot be removed.' },
        { status: 400 }
      )
    }

    const updateData: Record<string, any> = {
      ...validatedData,
    }

    if (validatedData.createdDate) {
      updateData.createdDate = new Date(validatedData.createdDate)
    }

    const project = await Project.findByIdAndUpdate(projectId, updateData, {
      new: true,
      runValidators: true,
    })
      .select('-__v')
      .lean()

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: project }, { status: 200 })
  } catch (error: any) {
    console.error('Error updating project:', error)

    if (error instanceof ZodError) {
      return handleZodError(error)
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json(
        { error: 'Validation error', details: errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update project', message: error.message || 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

// DELETE - Remove a project
export async function DELETE(_: NextRequest, context: { params: Promise<{ id?: string }> | { id?: string } }) {
  try {
    const params = await context.params
    const projectId = params?.id

    if (!projectId || !validateObjectId(projectId)) {
      return NextResponse.json({ error: 'Invalid project id' }, { status: 400 })
    }

    try {
      await connectDB()
    } catch (dbError: any) {
      return handleDbConnectionError(dbError)
    }

    const project = await Project.findByIdAndDelete(projectId).select('-__v').lean()

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json(
      { success: true, message: 'Project deleted successfully' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { error: 'Failed to delete project', message: error.message || 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
