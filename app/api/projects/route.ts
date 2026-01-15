import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import connectDB from '@/lib/db'
import Project from '@/models/Project'
import { projectCreateSchema, projectQuerySchema } from '@/lib/validations/project'

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

// POST - Create a new project
export async function POST(request: NextRequest) {
  try {
    try {
      await connectDB()
    } catch (dbError: any) {
      return handleDbConnectionError(dbError)
    }

    const body = await request.json()

    let validatedData
    try {
      validatedData = projectCreateSchema.parse(body)
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error)
      }
      throw error
    }

    const project = new Project({
      title: validatedData.title,
      subtitle: validatedData.subtitle,
      description: validatedData.description,
      users: validatedData.users,
      type: validatedData.type,
      createdDate: validatedData.createdDate ? new Date(validatedData.createdDate) : undefined,
    })

    await project.save()

    return NextResponse.json(
      {
        success: true,
        message: 'Project created successfully',
        data: {
          id: project._id,
          title: project.title,
          subtitle: project.subtitle,
          description: project.description,
          users: project.users,
          type: project.type,
          createdDate: project.createdDate,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating project:', error)

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

    if (error.name === 'MongoNetworkError' || error.message?.includes('SSL') || error.message?.includes('TLS')) {
      return NextResponse.json(
        {
          error: 'Database connection error',
          message: 'Unable to connect to the database. Please check your MongoDB connection settings.',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        },
        { status: 503 }
      )
    }

    return NextResponse.json(
      {
        error: 'Failed to create project',
        message: error.message || 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}

// GET - Retrieve all projects
export async function GET(request: NextRequest) {
  try {
    try {
      await connectDB()
    } catch (dbError: any) {
      return handleDbConnectionError(dbError)
    }

    const { searchParams } = new URL(request.url)

    let queryParams
    try {
      queryParams = projectQuerySchema.parse({
        page: searchParams.get('page') || '1',
        limit: searchParams.get('limit') || '10',
        type: searchParams.get('type') || undefined,
      })
    } catch (error) {
      if (error instanceof ZodError) {
        return handleZodError(error)
      }
      throw error
    }

    const { page, limit, type } = queryParams
    const skip = (page - 1) * limit
    const filter = type ? { type } : {}

    const total = await Project.countDocuments(filter)

    const projects = await Project.find(filter)
      .sort({ createdDate: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v')
      .lean()

    return NextResponse.json(
      {
        success: true,
        data: projects,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error fetching projects:', error)

    if (error.name === 'MongoNetworkError' || error.message?.includes('SSL') || error.message?.includes('TLS')) {
      return NextResponse.json(
        {
          error: 'Database connection error',
          message: 'Unable to connect to the database. Please check your MongoDB connection settings.',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        },
        { status: 503 }
      )
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch projects',
        message: error.message || 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}
