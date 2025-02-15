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
 * @returns {Promise<string | undefined>} The `refresh_token_id` if successful, otherwise `undefined`.
 */
export const insertRefreshToken = async (
  userId: number,
  refreshTokenId: string,
  tokenHash: string,
  expires: Date,
  deviceIp: string,
  userAgent: string
): Promise<string | undefined> => {
  try {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO refresh_tokens 
      (user_id, refresh_token_id, token_hash, device_ip, user_agent, last_used_at, refresh_count, expires_at) 
      VALUES (?, ?, ?, ?, ?, NOW(), 0, ?)`,
      [userId, refreshTokenId, tokenHash, deviceIp, userAgent, expires]
    );

    return result.affectedRows > 0 ? refreshTokenId : undefined;
  } catch (error) {
    console.error("❌ Failed to insert refresh token:", error);
    return undefined;
  }
};

/**
 * Checks if a hashed refresh token exists in the database.
 *
 * @param {string} hashedToken - The hashed refresh token to check.
 * @returns {Promise<boolean>} `true` if the token exists, otherwise `false`.
 */
export const selectRefreshToken = async (tokenId: string): Promise<string | void> => {
  try {
    const [result] = await pool.query<RowDataPacket[]>(
      "SELECT token_hash FROM refresh_tokens WHERE refresh_token_id = ?",
      [tokenId]
    );

    if (result.length > 0) {
      return result[0].token_hash; // ✅ Return the hashed refresh token
    }

    return; // ✅ Explicitly return void if not found
  } catch (error) {
    console.error("❌ Failed to select refresh token:", error);
    return; // ✅ Return void on error
  }
};
