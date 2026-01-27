import mongoose, { Schema, Document, Model } from "mongoose"

export interface IManuscriptComment extends Document {
  manuscriptId: string
  author: string
  content: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

const ManuscriptCommentSchema: Schema = new Schema(
  {
    manuscriptId: {
      type: String,
      required: [true, "Manuscript id is required"],
      trim: true,
    },
    author: {
      type: String,
      required: [true, "Author is required"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
      minlength: [1, "Content must not be empty"],
      maxlength: [5000, "Content cannot exceed 5000 characters"],
    },
    avatar: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
)

ManuscriptCommentSchema.index({ manuscriptId: 1, createdAt: -1 })

const ManuscriptComment: Model<IManuscriptComment> =
  mongoose.models.ManuscriptComment || mongoose.model<IManuscriptComment>("ManuscriptComment", ManuscriptCommentSchema)

export default ManuscriptComment
