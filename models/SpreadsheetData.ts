import mongoose, { Schema, Document, Model } from "mongoose"

export interface ISpreadsheetData extends Document {
  projectId: string
  data: Array<Record<string, string>>
  columns: string[]
  createdBy?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const SpreadsheetDataSchema: Schema = new Schema(
  {
    projectId: {
      type: String,
      required: [true, "Project id is required"],
      trim: true,
      unique: true,
    },
    data: {
      type: [Schema.Types.Mixed],
      default: [],
    },
    columns: {
      type: [String],
      default: () => Array.from({ length: 10 }, (_, i) => String.fromCharCode(65 + i)),
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

SpreadsheetDataSchema.index({ projectId: 1 })

const SpreadsheetData: Model<ISpreadsheetData> =
  mongoose.models.SpreadsheetData || mongoose.model<ISpreadsheetData>("SpreadsheetData", SpreadsheetDataSchema)

export default SpreadsheetData
