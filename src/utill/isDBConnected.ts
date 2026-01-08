import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Keep track of the connection across serverless invocations
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
    // Connect with proper options for serverless
    await mongoose.connect(uri, {
      // optional but recommended
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // increase timeout for slow connections
    });

    isConnected = true;
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    throw error;
  }

  // Optional: listen for disconnects (good for serverless debugging)
  mongoose.connection.on("disconnected", () => {
    console.log("⚠️ MongoDB disconnected");
    isConnected = false;
  });
};
