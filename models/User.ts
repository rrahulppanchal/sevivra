import mongoose, { Schema, Document, Model } from 'mongoose'
import bcrypt from 'bcryptjs'

export type UserRole = 'super_admin' | 'user'

export interface IUser extends Document {
  name: string
  email: string
  password: string
  role: UserRole
  institution?: string
  isApproved: boolean
  approvedAt?: Date
  approvedBy?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't include password in queries by default
    },
    role: {
      type: String,
      enum: ['super_admin', 'user'],
      required: [true, 'Role is required'],
      default: 'user',
    },
    institution: {
      type: String,
      trim: true,
      maxlength: [200, 'Institution cannot exceed 200 characters'],
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    approvedAt: {
      type: Date,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
)

// Create indexes
UserSchema.index({ email: 1 })
UserSchema.index({ role: 1 })
UserSchema.index({ isApproved: 1 })

// Hash password before saving
UserSchema.pre('save', async function (this: IUser) {
  // Skip if password doesn't exist
  if (!this.password) {
    return
  }
  
  // Check if password is already a valid bcrypt hash (60 chars, starts with $2a$, $2b$, or $2y$)
  const isBcryptHash = /^\$2[ayb]\$.{56}$/.test(this.password)
  
  // For new documents or when password is modified, hash it if it's not already hashed
  const isNew = this.isNew
  const isModified = this.isModified('password')
  
  // Hash if: (new document) OR (modified and not already a hash)
  if ((isNew || isModified) && !isBcryptHash) {
    try {
      const salt = await bcrypt.genSalt(10)
      this.password = await bcrypt.hash(this.password, salt)
    } catch (error: any) {
      throw new Error(`Password hashing failed: ${error.message}`)
    }
  }
})

// Method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

export default User

