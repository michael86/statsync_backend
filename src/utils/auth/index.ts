import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Response } from "express";

const isProduction = process.env.NODE_ENV === "production";

interface JwtPayload {
  id: number;
  email: string;
}
type JwtExpiry = "15m" | "30m" | "1h" | "6h" | "12h" | "24h" | "30d";

export const generateJwtToken = (expiry: JwtExpiry, payload: JwtPayload) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: expiry });
};

export const generateRefreshToken = () => crypto.randomBytes(64).toString("hex");

export const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
  res
    .cookie("access_token", accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "none",
      maxAge: 15 * 60 * 1000, // 15 minutes
    })
    .cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "none",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
};
