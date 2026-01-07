import dotenv from "dotenv";
import mongoose from "mongoose";
import express from "express";
import cors from "cors";

// Routes
import userRoutes from "./route/UserRoute";
import AdRoute from "./route/AdRoute";
import News from "./route/News";

dotenv.config();

const MONGODB_URL = process.env.MONGODB_URL as string;
const SERVER_PORT = process.env.SERVER_PORT || 5000;

const app = express();

// ✅ Parse JSON
app.use(express.json());

// ✅ CORS CONFIGURATION
const allowedOrigins = [
  "https://sf-fe-iota.vercel.app/"
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ ROUTES
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/ads", AdRoute);
app.use("/api/v1/news", News);

// ✅ CONNECT MONGODB
mongoose
  .connect(MONGODB_URL)
  .then(() => {
    console.log("\nDatabase Connected!..\n======================\n\n");
  })
  .catch((err) => {
    console.log("Database connection failed \n Error: " + err);
    process.exit(1);
  });

app.get("/", (req, res) => {
  res.send("Smart Farmer Backend is running ✅");
});

// ✅ START SERVER
app.listen(SERVER_PORT, () => {
  console.log("Server is running on port : " + SERVER_PORT);
});
