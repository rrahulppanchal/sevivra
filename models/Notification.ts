import mongoose, { Schema, Document, Model } from "mongoose"

export type NotificationType = "collaboration_request" | "review_request" | "info" | "success" | "warning"
export type NotificationStatus = "unread" | "read" | "accepted" | "declined"

export interface INotification extends Document {
  recipientId: mongoose.Types.ObjectId
  senderId?: mongoose.Types.ObjectId
  type: NotificationType
  title: string
  message: string
  status: NotificationStatus
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

const NotificationSchema: Schema = new Schema(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      enum: ["collaboration_request", "review_request", "info", "success", "warning"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ["unread", "read", "accepted", "declined"],
      default: "unread",
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  { timestamps: true }
)

NotificationSchema.index({ recipientId: 1, createdAt: -1 })
NotificationSchema.index({ status: 1 })

const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema)

export default Notification
