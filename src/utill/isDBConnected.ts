import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config();

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return; // already connected
  try {
    await mongoose.connect(process.env.MONGODB_URL!);
    isConnected = true;
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
};
