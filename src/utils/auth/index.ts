import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Response } from "express";

const isProduction = process.env.NODE_ENV === "production";

interface JwtPayload {
  id: number;
  email: string;
}

type JwtExpiry = "15m" | "30m" | "1h" | "6h" | "12h" | "24h" | "30d";

/**
 * Generates a JWT (JSON Web Token) for user authentication.
 * @param {JwtExpiry} expiry - The expiration time for the token (e.g., "15m", "30d").
 * @param {JwtPayload} payload - The payload containing user information (id & email).
 * @returns {string} A signed JWT token.
 * @throws {Error} If the `JWT_SECRET` is missing in environment variables.
 */
export const generateJwtToken = (expiry: JwtExpiry, payload: JwtPayload): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: expiry });
};

/**
 * Generates a secure, random refresh token.
 * @returns {string} A 128-character hexadecimal string for the refresh token.
 */
export const generateRefreshToken = (): string => crypto.randomBytes(64).toString("hex");

/**
 * Sets authentication cookies in the HTTP response.
 * @param {Response} res - The Express response object.
 * @param {string} accessToken - The JWT access token.
 * @param {string} refreshToken - The refresh token.
 * @returns {Response} The response object with cookies set.
 */
export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
): Response => {
  return res
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
