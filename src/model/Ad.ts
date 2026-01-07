import mongoose, { Schema, Document } from "mongoose"

export interface IAd extends Document {
  title: string
  description: string
  price: number
  images: string[]
  category: string
  farmer: mongoose.Types.ObjectId
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const AdSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    images: {
      type: [String], // image URLs
      default: [],
    },

    category: {
      type: String,
      required: true,
    },

    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // farmer user
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
)

export default mongoose.model<IAd>("Ad", AdSchema)