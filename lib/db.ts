import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI || ''

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
}

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null }

if (!global.mongoose) {
  global.mongoose = cached
}

async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    // Determine connection type
    const isAtlas = MONGODB_URI.startsWith('mongodb+srv://')
    const isLocal = MONGODB_URI.includes('localhost') || MONGODB_URI.includes('127.0.0.1')

    // Base connection options - let MongoDB driver handle SSL automatically
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      // Retry options
      retryWrites: true,
      w: 'majority',
      // Connection pool options
      maxPoolSize: 10,
      minPoolSize: 5,
      // Timeout options
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 15000,
      // Let MongoDB handle SSL based on connection string
      // Don't force SSL settings - let the URI determine it
    }

    // Only explicitly set SSL for local connections (disable it)
    if (isLocal) {
      opts.ssl = false
    }
    // For Atlas and other connections, don't set SSL options
    // MongoDB driver will handle SSL automatically based on the connection string

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('✅ MongoDB connected successfully')
        return mongoose
      })
      .catch((error) => {
        console.error('❌ MongoDB connection error:', error.message)
        console.error('Connection string format:', isAtlas ? 'Atlas (mongodb+srv://)' : isLocal ? 'Local' : 'Standard')
        cached.promise = null
        throw error
      })
  }

  try {
    cached.conn = await cached.promise
  } catch (e: any) {
    cached.promise = null
    console.error('❌ Failed to connect to MongoDB:', e.message)
    throw e
  }

  return cached.conn
}

export default connectDB

