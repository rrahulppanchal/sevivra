import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IContact extends Document {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  createdAt: Date
  updatedAt: Date
}

const ContactSchema: Schema = new Schema(
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
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[\d\s\-\+\(\)]+$/, 'Please provide a valid phone number'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      minlength: [3, 'Subject must be at least 3 characters'],
      maxlength: [200, 'Subject cannot exceed 200 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      minlength: [10, 'Message must be at least 10 characters'],
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
  },
  {
    timestamps: true,
  }
)

// Create indexes for better query performance
ContactSchema.index({ email: 1 })
ContactSchema.index({ createdAt: -1 })

const Contact: Model<IContact> =
  mongoose.models.Contact || mongoose.model<IContact>('Contact', ContactSchema)

export default Contact

