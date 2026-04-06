import mongoose, { Schema, Document, Model } from "mongoose"

export interface IActivityLogEntry {
  action: "import_csv" | "ai_insert" | "manual_edit" | "export_csv"
  userId: mongoose.Types.ObjectId
  userName: string
  details?: string
  rowCount?: number
  timestamp: Date
}

export interface ISpreadsheetData extends Document {
  projectId: string
  data: Array<Record<string, string>>
  columns: string[]
  activityLog: IActivityLogEntry[]
  createdBy?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const ActivityLogEntrySchema = new Schema(
  {
    action: {
      type: String,
      enum: ["import_csv", "ai_insert", "manual_edit", "export_csv"],
      required: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    details: { type: String },
    rowCount: { type: Number },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false },
)

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
    activityLog: {
      type: [ActivityLogEntrySchema],
      default: [],
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
