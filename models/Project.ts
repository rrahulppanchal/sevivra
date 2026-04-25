import mongoose, { Schema, Document, Model } from 'mongoose'

export type ProjectType = 'Journal Articles' | 'Conference Papers' | 'Books & Chapters' | 'Preprints'

export interface IProject extends Document {
  title: string
  subtitle?: string
  description: string
  users: mongoose.Types.ObjectId[]
  type: ProjectType
  visibility: 'private' | 'public'
  createdDate: Date
  createdAt: Date
  updatedAt: Date
}

const ProjectSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: [200, 'Subtitle cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    type: {
      type: String,
      enum: ['Journal Articles', 'Conference Papers', 'Books & Chapters', 'Preprints'],
      required: [true, 'Type is required'],
    },
    visibility: {
      type: String,
      enum: ['private', 'public'],
      default: 'private',
    },
    createdDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

ProjectSchema.index({ type: 1 })
ProjectSchema.index({ createdDate: -1 })
ProjectSchema.index({ visibility: 1 })

const existingProjectModel = mongoose.models.Project as Model<IProject> | undefined

if (existingProjectModel && (!existingProjectModel.schema?.path('visibility') || existingProjectModel.schema?.path('owner'))) {
  delete mongoose.models.Project
}

const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema)

export default Project
