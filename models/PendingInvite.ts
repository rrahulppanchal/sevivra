import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IPendingInvite extends Document {
  email: string
  senderUserId: mongoose.Types.ObjectId
  senderName: string
  projectId: mongoose.Types.ObjectId
  projectTitle: string
  type: 'review_request' | 'collaboration_request'
  customMessage?: string
  createdAt: Date
  updatedAt: Date
}

const PendingInviteSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    senderUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    projectTitle: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['review_request', 'collaboration_request'],
      required: true,
    },
    customMessage: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

PendingInviteSchema.index({ email: 1 })
PendingInviteSchema.index({ email: 1, projectId: 1, type: 1 }, { unique: true })

const PendingInvite: Model<IPendingInvite> =
  mongoose.models.PendingInvite || mongoose.model<IPendingInvite>('PendingInvite', PendingInviteSchema)

export default PendingInvite
