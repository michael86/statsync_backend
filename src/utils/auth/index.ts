import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { deleteRefreshToken, insertRefreshToken } from "../../queries/authQueries";
import { v4 as uuidv4 } from "uuid";

const isProduction = process.env.NODE_ENV === "production";

interface JwtPayload {
  id: number;
  email: string;
}

type JwtExpiry = "1m" | "15m" | "30m" | "1h" | "6h" | "12h" | "24h" | "30d";

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
export const generateRefreshToken = () => {
  return { uuid: uuidv4(), refreshToken: crypto.randomBytes(64).toString("hex") };
};

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
export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshTokenId: string
): void => {
  res
    .cookie("access_token", accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "none",
      maxAge: 15 * 60 * 1000, // 15 minutes
    })
    .cookie("refresh_token_id", refreshTokenId, {
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
): Promise<{ refreshToken: string; accessToken: string; refreshTokenId: string }> => {
  const { deviceIp, userAgent } = getClientFingerprint(req);

  const accessToken = generateJwtToken("15m", { id: userId, email });
  const { uuid: refreshUid, refreshToken } = generateRefreshToken();

  const expiresAt = new Date();
  expiresAt.setUTCDate(expiresAt.getUTCDate() + 30);

  // Hash refresh token before storing
  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

  // Insert refresh token into DB and get refresh_token_id
  const refreshTokenId = await insertRefreshToken(
    userId,
    refreshUid,
    hashedRefreshToken,
    expiresAt,
    deviceIp,
    userAgent
  );

  if (!refreshTokenId) throw new Error("Failed to insert refresh token");

  // Store the actual refresh token id in memory, only accessible by the frontend
  setAuthCookies(res, accessToken, refreshUid);

  return { refreshToken, accessToken, refreshTokenId };
};

/**
 * Clears authentication cookies and sends a 403 response.
 * @param {Response} res - Express response object.
 * @param {string} message - The error message to send.
 * @param {string} tokenId - The refresh tokens id.
 */
export const invalidateSession = async (
  res: Response,
  message: string,
  tokenId?: string
): Promise<void> => {
  res.clearCookie("refresh_token_id", { httpOnly: true });
  res.clearCookie("access_token", { httpOnly: true });

  if (tokenId) {
    const deleted = await deleteRefreshToken(tokenId);

    if (!deleted) {
      console.warn(`⚠️ No refresh token found for ID: ${tokenId}`);
      res.status(403).json({ status: "invalid refresh token" });
      return;
    }
  }

  res.status(403).json({ status: message });
};

/**
 * Validates an email address format.
 *
 * @param {string} email - The email address to validate.
 * @returns {boolean} True if the email is valid, otherwise false.
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates a password against security requirements.
 *
 * @param {string} password - The password to validate.
 * @returns {boolean} True if the password meets the criteria, otherwise false.
 */
export const isValidPassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};
