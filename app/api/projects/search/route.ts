import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Project from '@/models/Project'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const type = searchParams.get('type') || ''
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)))
    const skip = (page - 1) * limit

    const filter: Record<string, any> = {
      visibility: 'public',
    }

    if (query.trim()) {
      filter.$or = [
        { title: { $regex: query.trim(), $options: 'i' } },
        { description: { $regex: query.trim(), $options: 'i' } },
      ]
    }

    if (type) {
      filter.type = type
    }

    const [projects, total] = await Promise.all([
      Project.find(filter)
        .populate('users', 'name email')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-__v')
        .lean(),
      Project.countDocuments(filter),
    ])

    const data = projects.map((project: any) => ({
      _id: project._id.toString(),
      title: project.title,
      subtitle: project.subtitle || '',
      description: project.description,
      type: project.type,
      visibility: project.visibility || 'private',
      users: project.users?.map((u: any) => ({
        id: u._id?.toString(),
        name: u.name,
      })) || [],
      createdDate: project.createdDate,
      updatedAt: project.updatedAt,
    }))

    return NextResponse.json({
      success: true,
      data,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error: any) {
    console.error('Search projects error:', error)
    return NextResponse.json(
      { error: 'Failed to search projects', message: error.message },
      { status: 500 }
    )
  }
}
