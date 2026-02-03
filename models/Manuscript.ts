import mongoose, { Schema, Document, Model } from "mongoose"

export interface IManuscript extends Document {
  projectId: string
  title: string
  contentHtml: string
  createdBy?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const ManuscriptSchema: Schema = new Schema(
  {
    projectId: {
      type: String,
      required: [true, "Project id is required"],
      trim: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [300, "Title cannot exceed 300 characters"],
    },
    contentHtml: {
      type: String,
      required: [true, "Content is required"],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
)

ManuscriptSchema.index({ projectId: 1, createdAt: -1 })

const Manuscript: Model<IManuscript> =
  mongoose.models.Manuscript || mongoose.model<IManuscript>("Manuscript", ManuscriptSchema)

export default Manuscript
