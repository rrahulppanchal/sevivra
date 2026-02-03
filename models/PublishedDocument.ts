import mongoose, { Schema, Document, Model } from "mongoose"

export interface IPublishedDocument extends Document {
  projectId: string
  manuscriptId?: string
  title?: string
  contentHtml: string
  createdAt: Date
  updatedAt: Date
}

const PublishedDocumentSchema: Schema = new Schema(
  {
    projectId: {
      type: String,
      required: [true, "Project id is required"],
      trim: true,
    },
    manuscriptId: {
      type: String,
      trim: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: [300, "Title cannot exceed 300 characters"],
    },
    contentHtml: {
      type: String,
      required: [true, "Content is required"],
    },
  },
  {
    timestamps: true,
  },
)

PublishedDocumentSchema.index({ projectId: 1, createdAt: -1 })

const PublishedDocument: Model<IPublishedDocument> =
  mongoose.models.PublishedDocument || mongoose.model<IPublishedDocument>("PublishedDocument", PublishedDocumentSchema)

export default PublishedDocument
