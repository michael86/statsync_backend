import express, { Request, Response } from "express";
import dotenv from "dotenv";
import pool from "./config/db"; // Database connection
import cors from "cors";
import cookieParser from "cookie-parser";

import userController from "./routes/users";
import authController from "./routes/auth";

dotenv.config(); // Load .env variables

const app = express();
const port = process.env.PORT || 5000; // Default to 5000 if PORT is undefined

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

// Basic route
app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

// Start server
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
