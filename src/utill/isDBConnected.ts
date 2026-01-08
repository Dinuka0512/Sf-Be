import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    console.log("MongoDB already connected ✅");
    return;
  }

  const uri = process.env.MONGODB_URL;
  if (!uri) {
    throw new Error("MONGODB_URL not set in environment variables!");
  }

  try {
    // Mongoose 7+ no longer needs useNewUrlParser & useUnifiedTopology
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000, // optional: increases timeout
    });

    isConnected = true;
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    throw error;
  }

  // Optional: handle disconnects
  mongoose.connection.on("disconnected", () => {
    console.log("⚠️ MongoDB disconnected");
    isConnected = false;
  });
};
