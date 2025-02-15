import { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../config/db";
import { v4 as uuidv4 } from "uuid";

/**
 * Inserts a new refresh token into the database.
 *
 * @param {number} userId - The ID of the user.
 * @param {string} tokenHash - The hashed refresh token.
 * @param {Date} expires - The expiration date of the refresh token.
 * @param {string} deviceIp - The user's IP address.
 * @param {string} userAgent - The user's browser and OS information.
 * @returns {Promise<number | undefined>} The insert ID if successful, otherwise undefined.
 */
export const insertRefreshToken = async (
  userId: number,
  tokenHash: string,
  expires: Date,
  deviceIp: string,
  userAgent: string
): Promise<string | undefined> => {
  try {
    const refreshTokenId = uuidv4(); // Generate unique token ID

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO refresh_tokens 
      (user_id, refresh_token_id, token_hash, device_ip, user_agent, last_used_at, refresh_count, expires_at) 
      VALUES (?, ?, ?, ?, ?, NOW(), 0, ?)`,
      [userId, refreshTokenId, tokenHash, deviceIp, userAgent, expires]
    );

    // If insertion was successful, return `refresh_token_id`
    return result.affectedRows > 0 ? refreshTokenId : undefined;
  } catch (error) {
    console.error("❌ Failed to insert refresh token:", error);
    return undefined;
  }
};

export const selectRefreshToken = async (hashedToken: string) => {
  try {
    console.log("hashedToken ", hashedToken);
    const [token] = await pool.query<RowDataPacket[]>(
      "SELECT token_hash FROM refresh_tokens where token_hash = ?",
      [hashedToken]
    );

    console.log("result ", token);

    return token.length > 0;
  } catch (error) {
    console.error(error);
    return;
  }
};
