import express, { Request, Response } from "express";
import dotenv from "dotenv";
import pool from "./config/db"; // Database connection
import cors from "cors";
import cookieParser from "cookie-parser";

import userController from "./routes/users";
import authController from "./routes/auth";

dotenv.config(); // Load .env variables

const app = express();

// Log database connection status
pool
  .getConnection()
  .then((conn) => {
    console.log("✅ Database connected successfully!");
    conn.release(); // Release the connection back to the pool
  })
  .catch((err) => console.error("❌ Database connection failed:", err));

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true, // ✅ Allow sending cookies
  })
);

// ✅ Middleware to read JSON bodies
app.use(express.json());

//enable cookie parser
app.use(cookieParser());

// controllers
app.use("/users", userController);
app.use("/auth/", authController);

// Start server only if NOT in test mode
if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    console.log(`✅ Server is running at http://localhost:${PORT}`);
  });
}

export { app, pool };
