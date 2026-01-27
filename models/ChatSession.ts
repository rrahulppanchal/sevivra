import mongoose, { Schema, Document, Model } from "mongoose"

export interface ChatMessage {
  type: "user" | "ai"
  content: string
  timestamp: Date
}

export interface TimelineItem {
  id: string
  text: string
  level: number
  index: number
}

export interface IChatSession extends Document {
  manuscriptId: string
  manuscriptTitle?: string
  model?: string
  messages: ChatMessage[]
  generatedContent?: string
  timeline: TimelineItem[]
  createdAt: Date
  updatedAt: Date
}

const ChatMessageSchema = new Schema<ChatMessage>(
  {
    type: {
      type: String,
      enum: ["user", "ai"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
)

const TimelineItemSchema = new Schema<TimelineItem>(
  {
    id: {
      type: String,
      required: true,
      trim: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: Number,
      required: true,
      min: 1,
      max: 4,
    },
    index: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
)

const ChatSessionSchema: Schema = new Schema(
  {
    manuscriptId: {
      type: String,
      required: [true, "Manuscript id is required"],
      trim: true,
    },
    manuscriptTitle: {
      type: String,
      trim: true,
    },
    model: {
      type: String,
      trim: true,
    },
    messages: {
      type: [ChatMessageSchema],
      default: [],
    },
    generatedContent: {
      type: String,
    },
    timeline: {
      type: [TimelineItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
)

ChatSessionSchema.index({ manuscriptId: 1 })
ChatSessionSchema.index({ updatedAt: -1 })

const ChatSession: Model<IChatSession> =
  mongoose.models.ChatSession || mongoose.model<IChatSession>("ChatSession", ChatSessionSchema)

export default ChatSession
