import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import connectDB from '@/lib/db'
import Contact from '@/models/Contact'
import { contactFormSchema, contactQuerySchema } from '@/lib/validations/contact'

// POST - Create a new contact submission
export async function POST(request: NextRequest) {
  try {
    // Connect to database
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

    const body = await request.json()

    // Validate request body with Zod
    let validatedData
    try {
      validatedData = contactFormSchema.parse(body)
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            error: 'Validation error',
            details: error.errors.map((err) => ({
              path: err.path.join('.'),
              message: err.message,
            })),
          },
          { status: 400 }
        )
      }
      throw error
    }

    // Create new contact with validated data
    const contact = new Contact({
      name: validatedData.name,
      email: validatedData.email,
      phone: validatedData.phone || undefined,
      subject: validatedData.subject,
      message: validatedData.message,
    })

    await contact.save()

    return NextResponse.json(
      {
        success: true,
        message: 'Contact form submitted successfully',
        data: {
          id: contact._id,
          name: contact.name,
          email: contact.email,
          subject: contact.subject,
          createdAt: contact.createdAt,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating contact:', error)

    // Handle Zod validation errors (shouldn't reach here if validation is done above, but just in case)
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.errors.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      )
    }

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json(
        { error: 'Validation error', details: errors },
        { status: 400 }
      )
    }

    // Handle network/connection errors
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
        error: 'Failed to submit contact form',
        message: error.message || 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}

// GET - Retrieve all contact submissions
export async function GET(request: NextRequest) {
  try {
    // Connect to database
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

    const { searchParams } = new URL(request.url)

    // Validate query parameters with Zod
    let queryParams
    try {
      queryParams = contactQuerySchema.parse({
        page: searchParams.get('page') || '1',
        limit: searchParams.get('limit') || '10',
      })
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            error: 'Invalid query parameters',
            details: error.errors.map((err) => ({
              path: err.path.join('.'),
              message: err.message,
            })),
          },
          { status: 400 }
        )
      }
      throw error
    }

    const { page, limit } = queryParams
    const skip = (page - 1) * limit

    // Get total count
    const total = await Contact.countDocuments()

    // Get contacts with pagination
    const contacts = await Contact.find()
      .sort({ createdAt: -1 }) // Most recent first
      .skip(skip)
      .limit(limit)
      .select('-__v') // Exclude version key
      .lean()

    return NextResponse.json(
      {
        success: true,
        data: contacts,
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
    console.error('Error fetching contacts:', error)

    // Handle network/connection errors
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
        error: 'Failed to fetch contacts',
        message: error.message || 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}

