import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { insertRefreshToken } from "../../queries/authQueries";

const isProduction = process.env.NODE_ENV === "production";

interface JwtPayload {
  id: number;
  email: string;
}

type JwtExpiry = "15m" | "30m" | "1h" | "6h" | "12h" | "24h" | "30d";

/**
 * Generates a JWT (JSON Web Token) for user authentication.
 *
 * @param {JwtExpiry} expiry - The expiration time for the token (e.g., "15m", "30d").
 * @param {JwtPayload} payload - The payload containing user information (id & email).
 * @returns {string} A signed JWT token.
 * @throws {Error} If `JWT_SECRET` is not defined.
 */
export const generateJwtToken = (expiry: JwtExpiry, payload: JwtPayload): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: expiry });
};

/**
 * Generates a secure, random refresh token.
 *
 * @returns {string} A 128-character hexadecimal string for the refresh token.
 */
export const generateRefreshToken = (): string => crypto.randomBytes(64).toString("hex");

/**
 * Extracts the client's device IP and User-Agent from the request.
 *
 * @param {Request} req - The Express request object.
 * @returns {{ deviceIp: string, userAgent: string }} The client's IP address and User-Agent string.
 */
export const getClientFingerprint = (req: Request): { deviceIp: string; userAgent: string } => {
  const deviceIp =
    (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "Unknown IP";
  const userAgent = req.headers["user-agent"] || "Unknown User-Agent";

  return { deviceIp, userAgent };
};

/**
 * Sets authentication cookies in the HTTP response.
 *
 * @param {Response} res - The Express response object.
 * @param {string} accessToken - The JWT access token.
 * @param {string} refreshToken - The refresh token.
 */
export const setAuthCookies = (res: Response, accessToken: string, refreshToken: string): void => {
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

/**
 * Generates JWT & refresh tokens, stores refresh token in DB, and sets authentication cookies.
 *
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {number} userId - The user's ID.
 * @param {string} email - The user's email.
 * @returns {Promise<void>} Stores tokens and sets cookies; throws an error if insertion fails.
 */
export const generateAndStoreTokens = async (
  req: Request,
  res: Response,
  userId: number,
  email: string
): Promise<void> => {
  const { deviceIp, userAgent } = getClientFingerprint(req);

  const accessToken = generateJwtToken("15m", { id: userId, email });
  const refreshToken = generateRefreshToken();

  const expiresAt = new Date();
  expiresAt.setUTCDate(expiresAt.getUTCDate() + 30);

  // Hash refresh token before storing
  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

  // Insert refresh token into DB and get refresh_token_id
  const refreshTokenId = await insertRefreshToken(
    userId,
    hashedRefreshToken,
    expiresAt,
    deviceIp,
    userAgent
  );

  if (!refreshTokenId) throw new Error("Failed to insert refresh token");

  // Store refresh_token_id in HTTP-only cookie, not the actual token
  res.cookie("refresh_token_id", refreshTokenId, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  // Store the actual refresh token in memory, only accessible by the frontend
  setAuthCookies(res, accessToken, refreshToken);
};
